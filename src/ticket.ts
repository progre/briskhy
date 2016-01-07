export default class Ticket {
    constructor(
        public id: string,
        public categoryTerm: string,
        public authorUsername: string,
        public published: string,
        public updated: string,
        public title: string,
        public summary: string,
        public link: string
    ) {}
}
