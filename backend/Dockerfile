FROM golang:1.23-alpine AS build
WORKDIR /src
RUN apk add --no-cache ca-certificates git
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/financeai-api ./cmd/api

FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata && addgroup -S financeai && adduser -S financeai -G financeai
USER financeai
COPY --from=build /out/financeai-api /usr/local/bin/financeai-api
EXPOSE 8080
ENTRYPOINT ["financeai-api"]
