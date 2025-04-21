use std::ops::Range;

pub struct SourceMap {
    line_starts: Vec<usize>,
}

impl SourceMap {
    pub fn new(source: &String) -> Self {
        let line_starts = Self::compute_line_starts(&source);
        Self { line_starts }
    }
    
    fn compute_line_starts(source: &str) -> Vec<usize> {
        let mut starts = vec![0];
        for (i, c) in source.char_indices() {
            if c == '\n' {
                starts.push(i + 1);
            }
        }
        starts
    }
    
    pub fn get_line_column(&self, span: &Range<usize>) -> (usize, usize) {
        // Binary search to find the line
        let pos = span.start;
        let line_idx = match self.line_starts.binary_search(&pos) {
            Ok(idx) => idx,
            Err(idx) => idx - 1,
        };
        
        let line = line_idx + 1; // 1-based line number
        let column = pos - self.line_starts[line_idx] + 1; // 1-based column
        
        (line, column)
    }
    
    pub fn get_line(&self, span: &Range<usize>) -> usize {
        let (line, _) = self.get_line_column(span);
        line
    }
    
    pub fn get_column(&self, span: &Range<usize>) -> usize {
        let (_, column) = self.get_line_column(span);
        column
    }
}
