export interface Note {
    line: number;
    content: string;
    type: string;
    checked: boolean;
}

export interface NotesByFile {
    [file: string]: { fileUri: string; notes: Note[] };
}
