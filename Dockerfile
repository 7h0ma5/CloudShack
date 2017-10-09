FROM ubuntu:trusty

ADD _build/prod/rel/cloudshack /app
RUN mkdir -p /var/lib/cloudshack

EXPOSE 2237/udp
EXPOSE 7373

VOLUME ["/var/lib/cloudshack"]

CMD ["/app/bin/cloudshack", "foreground"]
