export interface FirmusNotification {
    id: string;
    title: string;
    body: string;

    get data(): {
        [key: string]: string;
    };
}

export class ChatNotification implements FirmusNotification {
    id: string;
    type = "chat";
    chat_id: string;
    title: string;
    body: string;

    constructor(message: string, chat_id: string, sender: string) {
        this.title = sender;
        this.body = message;
        this.chat_id = message;
        this.type = "chat";
    }

    get data(): {
        [key: string]: string;
    } {
        return {
            id: this.id,
            type: this.type,
            title: this.title,
            chat_id: this.chat_id.toString(),
            message: this.body,
            sender: this.title,
        };
    }
}

export class MatchWithCompanyNotification implements FirmusNotification {
    id: string;
    type = "match";
    match_id: string;
    title: string;
    body: string;

    constructor(match_id: string, company_name: string) {
        this.title = `Novi match sa poslodavcem ${company_name}!`;
        this.body = `Klikni ovdje za pregled svih matcheva`;
        this.match_id = match_id;
        this.type = "match";
    }

    get data(): {
        [key: string]: string;
    } {
        return {
            id: this.id,
            type: this.type,
            title: this.title,
            match_id: this.match_id.toString(),
        };
    }
}
