all: run

run: build
	@echo "\033[1;34mRunning docker compose...\033[0m"
	@docker-compose -f docker-compose.yml up

build: deps
	@echo "\033[1;32mBuilding images...\033[0m"
	@docker-compose -f docker-compose.yml build --no-cache

deps:
	@echo "\033[1;32mChecking dependencies...\033[0m"
	@if [ ! -d "front-end/node_modules" ]; then npm i --prefix front-end; fi
# @if [ ! -d "front-end/.next" ]; then cd front-end && npm run build; fi

logs:
	@echo "\033[1;34m- - - - - - - - - - - - backend logs - - - - - - - - - - -\033[0m" && docker logs backend   	 || true
	@echo "\033[1;34m- - - - - - - - - - - - frontend logs - - - - - - - - - - \033[0m" && docker logs frontend 	 || true
	@echo "\033[1;34m- - - - - - - - - - - - psql logs - - - - - - - - - - - - \033[0m" && docker logs psql          || true
#	@echo "\033[1;34m- - - - - - - - - - - - nginx logs - - - - - - - - - - - -\033[0m" && docker logs nginx 		 || true
	@echo "\033[1;34m- - - - - - - - - - - - redis logs - - - - - - - - - - - -\033[0m" && docker logs redis 		 || true
	@echo "\033[1;34m- - - - - - - - - - - - elasticsearch logs - - - - - - - -\033[0m" && docker logs elasticsearch || true
	@echo "\033[1;34m- - - - - - - - - - - - logstash logs - - - - - - - - - - \033[0m" && docker logs logstash      || true
	@echo "\033[1;34m- - - - - - - - - - - - kibana logs - - - - - - - - - - - \033[0m" && docker logs kibana        || true

ps:
	@echo "\033[1;34m- - - - - - - - - - - - compose - - - - - - - - - - - \033[0m" && docker-compose ps || true
	@echo "\033[1;34m- - - - - - - - - - - - containers - - - - - - - - - -\033[0m" && docker ps         || true

ls:
	@echo "\033[1;34m- - - - - - - - - - - - compose - - - - - - - - - - - - \033[0m" && docker-compose ls || true
	@echo "\033[1;34m- - - - - - - - - - - - images  - - - - - - - - - - - - \033[0m" && docker image   ls || true
	@echo "\033[1;34m- - - - - - - - - - - - volumes - - - - - - - - - - - - \033[0m" && docker volume  ls || true
	@echo "\033[1;34m- - - - - - - - - - - - network - - - - - - - - - - - - \033[0m" && docker network ls || true

restart:
	@echo "\033[1;32mRestarting...\033[0m"
	@docker-compose -f docker-compose.yml restart

start:
	@echo "\033[1;32mStarting...\033[0m"
	@docker-compose -f docker-compose.yml start

stop:
	@echo "\033[1;33mStopping...\033[0m"
	@docker-compose -f docker-compose.yml stop

down: stop
	@echo "\033[1;33mShutting down...\033[0m"
	@docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans

fclean: down
	@echo "\033[1;33mRemoving all containers and volumes...\033[0m"
	@docker system prune -af
	@docker builder prune -af

re: fclean all
