onmessage = (ev) => {
    const matrix = ev.data;
    let data = {
      maxTime : 0,
      finished : false
    };

    for(let i = 0; i < matrix.length; i++){
        let newMatrix = [];
        for(let j = 0; j < matrix[i].length; j++){
            if(j % 2 === 0 || j === 0)
                continue;
            newMatrix.push(matrix[i][j]);
        }
        newMatrix.sort((a,b) => parseInt(a) - parseInt(b));
        data.maxTime += newMatrix[0];
        postMessage(data);
    }
    data.finished = true;
    postMessage(data);
}