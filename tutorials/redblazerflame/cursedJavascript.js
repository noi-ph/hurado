const obj1 = {
    a: 0,
};

const obj2 = {
    a: 0,
};

const proxyForObj2 = new Proxy(obj2, {
    set: function (target, key, value) {
        return Reflect.set(obj1, key, value);
    },
});

proxyForObj2.a = 10; // So obj2.a === 10 now, right?

console.log(obj2.a); // nope, it is still 0

console.log(obj1.a); // why is this 10???
