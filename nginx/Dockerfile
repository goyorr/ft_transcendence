FROM nginx:alpine

RUN apk add --no-cache bash curl git && \
    curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64" && \
    chmod +x mkcert-v*-linux-amd64 && \
    mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert && \
    mkcert -install

RUN mkdir /etc/nginx/certs

RUN mkcert -cert-file /etc/nginx/certs/localhost.pem -key-file /etc/nginx/certs/localhost-key.pem localhost

COPY ./conf/nginx.conf /etc/nginx/conf.d

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]