export const transformNowIntoTimestamp = () => {
    const startTime: Date = new Date()

    const hour: number = startTime.getHours()
    let stringHour: string = hour.toString()
    const minutes: number = startTime.getMinutes()
    let stringMinutes: string = minutes.toString()

    if(hour < 10){
        stringHour = '0' + stringHour
    } 

    if(minutes < 10){
        stringMinutes = '0' + stringMinutes
    }

    return stringHour + ":" + stringMinutes
}

export const capitalize = (text: string) => {
    return text[0].toUpperCase() + text.slice(1)
}

export const normalizeDate = (date: string | undefined) => {
    if(date === undefined){
        return
    }
    
    const dateObj = new Date(date);
    
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; 
    
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutesStr} ${ampm}`;
}