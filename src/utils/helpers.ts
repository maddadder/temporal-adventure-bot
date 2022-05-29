// breaks a message up into chunks without breaking the word
export function chunk(input:string, len = 1500) {
    let curr = len;
    let prev = 0;

    let output:string[] = [];

    while (input[curr]) {
        if (input[curr++] == ' ') {
            output.push(input.substring(prev,curr));
            prev = curr;
            curr += len;
        }
    }
    output.push(input.substring(prev)); 
    return output;
}