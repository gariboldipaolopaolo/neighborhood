let data = {
    maxTime : 0,
    scheduler: null,
    finished : false
};

self.onmessage = (ev) => {
    const matrix = ev.data;
    let scheduler = new Array(matrix.length);
    for (let i = 0; i < scheduler.length; i++) {
        scheduler[i] = new Array(matrix[0].length);
    }

    s0(matrix, scheduler);
    data.finished = true;
    postMessage(data);
}

const s0 = (mac, scheduler) => {
    let tempoTotale=0;
    let riga =0;
    let temp1=0;

    for(let col=0; col< mac[riga].length; col++){
        let temp = mac[riga][col];
        let macchina=0;
        for(; riga< mac.length;riga++){
            if(temp>mac[riga][col]){
                temp=mac[riga][col];
                macchina=riga;
            }
        }
        scheduler[macchina][col]=temp;
        riga=temp1;
        tempoTotale += temp;
    }

    let tempiMax = 0;
    let tempoMacchina=0;
    let tempoT=0;
    for(let r=0; r<scheduler.length; r++){

        for(let col=0; col< scheduler[r].length; col++){
            if(scheduler[r][col]>0){
                //console.log(scheduler[r][col]+",");
                tempoMacchina += scheduler[r][col];
            }
        }

        if(tempoMacchina > tempiMax)
            tempiMax = tempoMacchina;
        data.maxTime = tempiMax;
        tempoT += tempoMacchina;
        tempoMacchina=0;
    }
    data.scheduler = scheduler;
};