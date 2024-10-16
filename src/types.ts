export interface Note {
    line: number;
    content: string;
    type: 'note' | 'audit' | 'todo';
    checked: boolean;
}

export interface NotesByFile {
    [file: string]: { fileUri: string; notes: Note[] };
}
