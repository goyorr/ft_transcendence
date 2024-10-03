FROM  python:3.11

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /backend

COPY ./requirements.txt /backend/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . /backend/

EXPOSE 8000

RUN chmod +x /backend/start.sh

RUN mkdir -p /backend/logs

ENTRYPOINT ["./start.sh"]
