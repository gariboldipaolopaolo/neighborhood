onmessage = (ev) => {
    const matrix = ev.data;
    let maxTime = 0;
    for(let i = 0; i < matrix.length; i++){
        matrix[i].sort((a,b) => parseInt(a) - parseInt(b));
        maxTime += matrix[i][0];
        postMessage(maxTime);
    }
}