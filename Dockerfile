FROM mhart/alpine-node:8
RUN yarn global add tplot

ENTRYPOINT ["tplot"]
