let data = {
    finished : false,
    newScheduler: null,
    bestSolution: 0,
    bestScheduler: null,
};

self.onmessage = (ev) => {
    const matrix = ev.data.matrix;
    debugger;
    data.bestSolution = ev.data.s0Value;
    data.newScheduler = ev.data.scheduler;
    data.bestScheduler = ev.data.scheduler;

    applyNeighborhood(matrix);

    data.finished = true;
    console.log('best s: '+ data.bestSolution);
    console.log('best sched: '+ data.bestScheduler);
    postMessage(data);
}

const applyNeighborhood = (baseMatrix) => {
    for(let q=0;q<5;q++){
        data.newScheduler = findSn(baseMatrix, data.newScheduler);
    }
}

/**
 * Trova le soluzioni Sn
 * @param baseMatrix matrice originale trasformata  Righe = macchine, Colonne = jobs .
 * @param scheduler matrice con la soluzione job scheduling alla iterazione N; la matrice presenta degli zeri dove il job non viene processato dalla macchina corrispondente ed i valori (in ms) in caso contrario.
 * @returns [][] nuova matrice soluzione
 */
const findSn = (baseMatrix, scheduler) => {
    //istanziamo la nuova matrice soluzione
    let newScheduler = new Array(scheduler.length);
    for (let i = 0; i < newScheduler.length; i++) {
        newScheduler[i] = new Array(scheduler[0].length);
    }

    const timeArray = computeTime(scheduler);
    const timeArrayCopy = timeArray.slice(0);
    const maxTime = timeArrayCopy.sort((a,b) => parseInt(a) - parseInt(b))[timeArrayCopy.length -1]; //prendo il tempo massimo della macchina più carica.
    const machineNumber = timeArray.indexOf(maxTime);
    const schedulerCopy = scheduler.map((arr) => arr.slice());

    const sortedArray = schedulerCopy[machineNumber].sort((a,b) => parseInt(a) - parseInt(b)); // trova minimo nella macchina per capire il numero della colonna e quindi il numero del job
    let minTime = 0;
    for(let i = 0; i < sortedArray.length; i++){
        if(sortedArray[i] === 0){
            continue;
        }
        minTime = sortedArray[i];
        break;
    }
    //const minTime = schedulerCopy[machineNumber].sort((a,b) => parseInt(a) - parseInt(b))[]; // trova minimo nella macchina per capire il numero della colonna e quindi il numero del job
    const jobNumber = findJobNumber(scheduler, machineNumber, minTime);
    scheduler[machineNumber][jobNumber] = 0; // azzera il job da spostare nel scheduler
    const nextMinValue = findNextMinValue(baseMatrix, minTime, jobNumber);

    const arrayTemp = new Array(baseMatrix.length);

    for(let s = 0; s<arrayTemp.length;s++){
        arrayTemp[s] = baseMatrix[s][jobNumber];
    }

    const newJobNumber = arrayTemp.indexOf(nextMinValue);
    scheduler[newJobNumber][jobNumber] = nextMinValue;

    stampaScheduler(scheduler);

    for(let i = 0; i < timeArray.length; i++){
        timeArray[i] = 0;
    }

    newScheduler = scheduler.map((arr) => arr.slice());

    const newTimeArray = computeTime(newScheduler);
    const newTimeArrayCopy = newTimeArray.slice(0);
    const newMaxTime = newTimeArrayCopy.sort((a,b) => parseInt(a) - parseInt(b))[newTimeArrayCopy.length -1];

    if(newMaxTime < data.bestSolution){
        data.bestSolution = newMaxTime;
        data.bestScheduler = newScheduler;
    }

    return newScheduler;
}

/**
 * Troviamo i totali in ms per ogni macchina
 * @param scheduler
 * @returns {any[]}
 */
const computeTime = (scheduler) => {
    const timeArray = new Array(scheduler.length);
    let t = 0;
    let singleMachineTotalTime = 0;

    for(let row = 0; row < scheduler.length; row++){
        for(let col=0; col< scheduler[row].length; col++){
            if(scheduler[row][col] > 0){
                singleMachineTotalTime += scheduler[row][col];
            }
        }
        timeArray[t] = singleMachineTotalTime;
        t++;
        singleMachineTotalTime = 0;
    }
    return timeArray;
}

/**
 * Trova il numero del job su cui cerchere il minimo più vicino (il suo neighbor che costa meno)
 * @param scheduler
 * @param machineNumber
 * @param minTime
 * @returns {number}
 */
const findJobNumber = (scheduler, machineNumber, minTime) => {
    for(let u = 0; u < scheduler[machineNumber].length; u++){
        if(scheduler[machineNumber][u] === minTime){
            return u;
        }
    }
    return 0;
}

/**
 * Trova il il nuovo minimo (in ms) per il job per cui verrà effettuoato lo swap
 * @param baseMatrix
 * @param mintime
 * @param jobNumber
 * @returns {number}
 */
const findNextMinValue = (baseMatrix, mintime, jobNumber) => {
    const array = new Array(baseMatrix.length);
    for(let r = 0; r < baseMatrix.length; r++){
        array[r] = baseMatrix[r][jobNumber];
    }

    array.sort((a,b) => parseInt(a) - parseInt(b)); // sortare l'array da più piccolo al più grande
    const indexMinTime = array.indexOf(mintime);

    return array[indexMinTime + 1];
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



