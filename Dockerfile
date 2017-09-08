FROM ubuntu:trusty

ADD _build/prod/rel/cloudshack /app

EXPOSE 2237/udp
EXPOSE 7373

CMD ["/app/bin/cloudshack", "foreground"]
