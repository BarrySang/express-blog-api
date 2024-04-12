/**
 * Class representing a text
 */
class TextGenerator {
    /**
     * 
     * @param {string[]} characters 
     * @param {string} word 
     * @param {string} sentence 
     * @param {string} paragraph 
     */
    constructor (characters, word, sentence, paragraph) {
        this.characters = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
        ]
        this.word = ''
        this.sentence = ''
        this.paragraph = ''
    }

    /**
     * 
     * @param {number} wordLength 
     * @returns string
     */
    generateWord(wordLength) {
        // reset word
        this.word = ''
        
        for (let i = 0; i < wordLength; i++) {
            this.word += this.characters[Math.floor(Math.random() * this.characters.length)]
        }
    
        return this.word
    }
    
    /**
     * 
     * @param {number} numberOfWords 
     * @param {number} lengthOfWord 
     * @returns string
     */
    generateSentence(numberOfWords, lengthOfWord) {
        // reset sentence
        this.sentence = ''
    
        for (let i = 0; i < numberOfWords; i++) {
            // this.word = generateWord(5)
            if (i === numberOfWords - 1) {
                this.sentence += this.generateWord(lengthOfWord)
            } else {
                this.sentence += this.generateWord(lengthOfWord) + ' '
            }
        }
    
        return this.sentence + '.'   
    }
    
    /**
     * 
     * @param {number} numberOfSentences 
     * @param {number} lengthOfSentence 
     * @param {number} lengthOfWord 
     * @returns string
     */
    generateParagraph(numberOfSentences, lengthOfSentence, lengthOfWord) {
        // reset paragraph
        this.paragraph = ''
    
        for (let i = 0; i < numberOfSentences; i ++) {
            this.sentence = this.generateSentence(lengthOfSentence, lengthOfWord)
            this.paragraph += this.sentence
        }
    
        return this.paragraph
    }

}

module.exports = TextGenerator