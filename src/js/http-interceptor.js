// Simple object to wrap callbacks for http interceptor.
// requestCb & responseCb will be executed for each http request & response respectively

function HttpInterceptor(requestCb, responseCb) {
    this.requestCb = requestCb;
    this.responseCb = responseCb;
}

