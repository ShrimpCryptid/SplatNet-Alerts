import rawTitleData from '../public/data/titledata.json';

export const TITLE_JSON_KEY_SUBJECTS = "subjects";
export const TITLE_JSON_KEY_ADJECTIVES = "adjectives";

export const SUBJECTS: string[] = rawTitleData[TITLE_JSON_KEY_SUBJECTS];
export const ADJECTIVES: string[] = rawTitleData[TITLE_JSON_KEY_ADJECTIVES];