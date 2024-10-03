import os
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.core.cache import cache

class Ratelimitingmidd(MiddlewareMixin):
    RATE_LIMIT = int(os.getenv('RATE_LIMIT', 1500))  
    TIME_PERIOD = int(os.getenv('TIME_PERIOD', 3600))  

    def process_request(self, request):
        ip = self.get_client_ip(request)

        key = f'rate-limit-{ip}'

        request_count = cache.get(key)
        if request_count is None:
            cache.set(key, 0, timeout=self.TIME_PERIOD)
            request_count = 0
        
        if request_count >= self.RATE_LIMIT:
            return JsonResponse({'error': 'Rate limit exceeded'}, status=429)
        
        cache.incr(key)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
