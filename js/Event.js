export function initEvent(mark) {
    mark.eventList = []
    mark.on = (eventName, cb) => {
        const fns = mark.eventList[eventName];
        if (Array.isArray(fns)) {
            fns.push(cb);
          } else {
            mark.eventList[eventName] = [cb];
          }
    }
    mark.emit = (eventName, ...payload) => {
        const fns = mark.eventList[eventName];
        if (Array.isArray(fns)) {
            fns.forEach((fn) => fn(...payload));
        }
    }
    mark.off = (eventName, cb) => {
        const fns = mark.eventList[eventName];
        const index = fns.find((fn) => fn === cb);
        if (Array.isArray(fns) && index) {
            fns.splice(index, 1);
        }
    }
}