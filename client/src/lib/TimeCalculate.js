const timeCalculate = (time) => {
    const hour = Math.floor(time/60);
    const minutes = time%60;

    return `${hour}hr ${minutes}min`
}

export default timeCalculate;