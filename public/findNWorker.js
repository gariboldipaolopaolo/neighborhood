let data = {
    maxTime : 0,
    scheduler: null,
    finished : false
};

self.onmessage = (ev) => {
    debugger;
    const matrix = ev.data.matrix;
    const scheduler = ev.data.scheduler;
    applyNeighborhood(matrix, scheduler);
    data.finished = true;
    postMessage(data);
}

const applyNeighborhood = (macchine, scheduler) => {
    for(let q=0;q<30;q++){
        findSn(macchine, scheduler);
    }
}

const findSn = (macchine, scheduler) => {
    let newScheduler = new Array(scheduler.length);
    for (let i = 0; i < newScheduler.length; i++) {
        newScheduler[i] = new Array(scheduler[0].length);
    }

    const tempi = calcolaTempi(scheduler); // crea array di tempi di ciascuna macchine
    const massimoImpegnato = tempi.sort((a,b) => parseInt(a) - parseInt(b))[tempi.length -1]; // cerca massimo dei tempi tra le macchine -> per capire da quale macchina togliere un job
    const numeroMacchinaMax = trovaNumeroMacchina(tempi,massimoImpegnato); // trova numero macchina corrispondente al tempo massimo

    for(let col=0; col< scheduler[numeroMacchinaMax].length; col++){
        if(scheduler[numeroMacchinaMax][col]>0){
            console.log(scheduler[numeroMacchinaMax][col] +",");
        }
    }

    const m = scheduler[numeroMacchinaMax].sort((a,b) => parseInt(a) - parseInt(b))[0]; // trova minimo nella macchina per capire il numero della colonna e quindi il numero del job
    let jobDaSpostare = togliDallaMacchina(scheduler,numeroMacchinaMax,m);

    scheduler[numeroMacchinaMax][jobDaSpostare]=0; // azzera il job da spostare nel scheduler
    const tempoJobDaAggiungere= trovaNuovoTempoDelJobDaSpostare(macchine,m,jobDaSpostare); // cerca il prossimo minimo tra i tempi nella colonna del job
    const arrayTemp = new Array(macchine.length);

    for(let s=0; s<arrayTemp.length;s++){
        arrayTemp[s]=macchine[s][jobDaSpostare];
        console.log(arrayTemp[s]+" ");
    }
    let numeroMacchinaNuovoTempo =trovaNumeroMacchina(arrayTemp,tempoJobDaAggiungere);

    scheduler[numeroMacchinaNuovoTempo][jobDaSpostare]=tempoJobDaAggiungere;
    stampaScheduler(scheduler);
    for(let d=0; d<tempi.length;d++){
        tempi[d]=0;
    }
    for (let q=0; q<scheduler.length; q++){
        for (let u=0; u<scheduler[q].length; u++){
            newScheduler[q][u]=scheduler[q][u];
        }
    }
    return newScheduler;
}

const calcolaTempi = (scheduler) => {
    const tempi = new Array(scheduler.length);
    let t=0;
    let tempoMacchina=0;
    let tempoT=0;
    for(let r=0; r<scheduler.length; r++){
        for(let col=0; col< scheduler[r].length; col++){
            if(scheduler[r][col]>0){
                tempoMacchina += scheduler[r][col];
            }
        }
        tempi[t]=tempoMacchina;
        t++;
        tempoT += tempoMacchina;
        tempoMacchina=0;
    }
    return tempi;
}

const trovaNumeroMacchina = (tempi, impegnato) => {
    for(let t=0; t<tempi.length; t++){
        if(impegnato===tempi[t]){
            return t;
        }
    }
    return 0;
}

const togliDallaMacchina = (mac, numeroMacchinaMax, m) => {
    for(let u=0; u<mac[numeroMacchinaMax].length; u++){
        if(mac[numeroMacchinaMax][u]===m){
            return u;
        }
    }
    return 0;
}

const trovaNuovoTempoDelJobDaSpostare = (mac, m, jobDaSpostare) => {
    const array = new Array(mac.length);
    let minimoSucessivo=0;
    for(let r=0; r<mac.length; r++){
        array[r]=mac[r][jobDaSpostare];
    }
    array.sort((a,b) => parseInt(a) - parseInt(b)); // sortare l'array da più piccolo al più grande
    for(let r=0; r<array.length; r++){
        if(m===array[r]){
            minimoSucessivo=array[r+1];
        }
    }
    return minimoSucessivo;
}

const stampaScheduler = (scheduler) => {
    console.log("\nNuovo scheduler: ");
    let tempoMacchina=0;
    let tempoT=0; let t=0;
    const tempi=new Array(scheduler.length);
    for(let r=0; r<scheduler.length; r++){
        console.log("\nmacchina "+r+": ");
        for(let col=0; col< scheduler[r].length; col++){
            if(scheduler[r][col]>0){
                console.log(scheduler[r][col] +",");
                tempoMacchina += scheduler[r][col];
            }
        }
        console.log(" | tempoMacchina="+tempoMacchina);
        tempi[t]=tempoMacchina;
        t++;
        tempoT += tempoMacchina;
        tempoMacchina=0;
    }
    console.log("\n\ntempoT="+tempoT); // somma di tutti i tempi delle macchine
    console.log("Tempo massimo impegnato dalle macchine: ");
    console.log(tempi.sort((a,b) => parseInt(a) - parseInt(b))[tempi.length -1]);
}



