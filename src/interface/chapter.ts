interface ChapterInterface {
  subject: string;
  chapter: string;
  class: string;
  unit: string;
  yearWiseQuestionCount: {
    [year: string]: number;
  };
  questionSolved: number;
  status: string;
  isWeakChapter: boolean;
}

export default ChapterInterface;