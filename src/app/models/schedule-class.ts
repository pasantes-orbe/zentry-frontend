export class Schedule {

    private day : string
    private start: Date
    private exit: Date

    constructor(day: string, start: Date, exit: Date){
        this.day = day,
        this.start = start,
        this.exit = exit
    }

    public getDay(): string {
        return this.day;
    }

    public setDay(day: string): void {
        this.day = day;
    }

    public getStart(): Date {
        return this.start;
    }

    public setStart(start: Date): void {
        this.start = start;
    }

    public getExit(): Date {
        return this.exit;
    }

    public setExit(exit: Date): void {
        this.exit = exit;
    }


    



}