function ajax(options) {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method, options.url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (options.token) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + options.token);
    }
    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            options.success(JSON.parse(xhr.responseText));
        } else {
            options.error(xhr.status, xhr.responseText);
        }
    };
    xhr.onerror = () => {
        options.error(xhr.status, xhr.statusText);
    };
    xhr.send(JSON.stringify(options.data));
}
