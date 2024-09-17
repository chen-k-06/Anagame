from itertools import combinations

class AnagramExplorer:
    #
    def __init__(self, all_words: list[str]):
       self.__corpus = all_words
       self.anagram_lookup = self.build_lookup_dict() # Only calculated once, when the explorer object is created

    @property
    def corpus(self):
      return self.__corpus
    
    def get_prime_map(self):
        prime_map = {'a': 2, 'b': 3, 'c': 5, 'd': 7, 'e': 11, 'f': 13,
        'g': 17, 'h': 19, 'i': 23, 'j': 29, 'k': 31, 'l': 37, 'm': 41, 'n': 43,
        'o': 47, 'p': 53, 'q': 59, 'r': 61, 's': 67, 't': 71, 'u': 73, 'v': 79,
        'w': 83, 'x': 89, 'y': 97, 'z': 101 }

        return prime_map

    def is_valid_anagram_pair(self, pair:tuple[str], letters:list[str]) -> bool:
        '''Checks whether a pair of words:
            -are both included in the allowable word list (self.corpus)
            -are both at least 3 letters long (and the same)
            -form a valid anagram pair
            -consist entirely of letters chosen at the beginning of the game

            Args:
                pair (tuple): Two strings representing the guessed pair
                letters (list): A list of letters from which the anagrams should be created

            Returns:
                bool: Returns True if the word pair fulfills all validation requirements, otherwise returns False
        '''
        ### BEGIN SOLUTION
        word_list = self.__corpus
        pair = list(pair)

        # removes all non-letter characters  
        pair[0] = "".join(char for char in pair[0] if char.isalpha())
        pair[1] = "".join(char for char in pair[1] if char.isalpha())

        #makes word 1 and 2 lowercase
        pair[0] = pair[0].lower()
        pair[1] = pair[1].lower()  

        # check if word is valid
        for word in pair: 
          if word not in word_list: 
             return False 
                  
        #check if lengths are equal and > 2      
        if len(pair[0]) < 3 and len(pair[0]) == len(pair[1]):
          return False
               
       #check variable types
        if type(pair[0]) != str or type(pair[1]) != str:
          return False
        
        #check that words are not identical
        if pair[0] == pair[1]:
           return False
               
        word1_product = 1
        word2_product = 1
        prime_map = self.get_prime_map()

        for char in pair[0]:
            if char.isalpha():
                word1_product *=  prime_map[char]

        for char in pair[1]:
            if char.isalpha():
                word2_product *=  prime_map[char]

        if word1_product != word2_product:
            return False
        
        for word in pair:
           letters_copy = [word for word in letters]

           for letter in word:
              if letter not in letters_copy:
                return False
              
              else: 
                letters_copy.remove(letter)
        
        return True
        ### END SOLUTION 

    def prime_hash(self, word: str):
        #calculates the prime hash value for a given word
        hash_value = 1
        prime_map = self.get_prime_map()
        
        for letter in word:
          if letter in prime_map:
            hash_value *= prime_map[letter]
        
        return hash_value
        
    def build_lookup_dict(self) -> dict:
        '''Creates a fast dictionary look-up (via either prime hash or sorted tuple) of all anagrams in a word corpus.
       
            Args:
                corpus (list): A list of words which should be considered

            Returns:
                dict: Returns a dictionary with  keys that return sorted lists of all anagrams of the key (per the corpus)
        '''
        ### BEGIN SOLUTION
        hash_dict = {}

        for word in self.__corpus:
            if len(word) < 3: 
               continue 
            
            prime_hash_value = self.prime_hash(word)

            if (prime_hash_value) in hash_dict:
                hash_dict[prime_hash_value].append(word)
                hash_dict[prime_hash_value] = sorted(hash_dict[prime_hash_value])
            
            else: 
                hash_dict[prime_hash_value] = [word]
                hash_dict[prime_hash_value] = sorted(hash_dict[prime_hash_value])

        return hash_dict

        ### END SOLUTION 

    def characters_of_word_in_letters(self, word, letters: list[str]) -> bool:
      letters_copy = [letter for letter in letters]
      word = list(word)
      for i in range(len(word)): 
        for j in range(len(letters_copy)):
            if word[i] == letters_copy[j]:
                word[i] = None
                letters_copy[j] = None

      if all(letter is None for letter in word):
         return True
      
      return False
    
    def get_prime_map(self):
      return {'a': 2, 'b': 3, 'c': 5, 'd': 7, 'e': 11, 'f': 13,
      'g': 17, 'h': 19, 'i': 23, 'j': 29, 'k': 31, 'l': 37, 'm': 41, 'n': 43,
      'o': 47, 'p': 53, 'q': 59, 'r': 61, 's': 67, 't': 71, 'u': 73, 'v': 79,
      'w': 83, 'x': 89, 'y': 97, 'z': 101 }

    def prime_hash(self, word: str): 
      prime_map = self.get_prime_map()
      hash_value = 1

      for letter in word:
        hash_value *= prime_map[letter]

      return hash_value
        
    def get_all_anagrams(self, letters: list[str]) -> set:
        '''Creates a set of all unique words that could have been used to form an anagram pair.
           Words which can't create any anagram pairs should not be included in the set.

            Ex)
            corpus: ["abed", "mouse", "bead", "baled", "abled", "rat", "blade"]
            all_anagrams: {"abed",  "abled", "baled", "bead", "blade"}

            Args:
              letters (list): A list of letters from which the anagrams should be created

            Returns:
              set: all unique words in corpus which form at least 1 anagram pair
        '''
        ### BEGIN SOLUTION

        unique_words = set()   

        letters_hash = self.prime_hash("".join(letters))

        for key, words in self.anagram_lookup.items():
          if len(words) > 1:
                for word in words:
                  if self.prime_hash(letters) % self.prime_hash(word) == 0:
                      unique_words.add(word)

        return unique_words

        ### END SOLUTION 

    def get_most_anagrams(self, letters:list[str]) -> str:
        '''Returns any word from one of the largest lists of anagrams that 
           can be formed using the given letters.
           
            Args:
              letters (list): A list of letters from which the anagrams should be created

            Returns:
              str: a single word from the largest anagram families
        '''
        ### BEGIN SOLUTION

        highest_length = 1
        highest_key = None

        for i, j in self.anagram_lookup.items():
          if len(j) > highest_length and self.characters_of_word_in_letters(j[0], letters):
              highest_length = len(j)
              highest_key = i

        return(self.anagram_lookup[highest_key][0])
                       
        ### END SOLUTION 

if __name__ == "__main__":
  words1 = [
     "abed","abet","abets","abut","acme","acre","acres","actors","actress","airmen","alert","alerted","ales","aligned","allergy","alter","altered","amen","anew","angel","angle","antler","apt",
     "bade","baste","bead","beast","beat","beats","beta","betas","came","care","cares","casters","castor","costar","dealing","gallery","glean","largely","later","leading","learnt","leas","mace","mane",
     "marine","mean","name","pat","race","races","recasts","regally","related","remain","rental","sale","scare","seal","tabu","tap","treadle","tuba","wane","wean"
  ]
  words2 = ['abed', 'mouse', 'bead', 'baled', 'rat', 'blade']

  letters = ['p', 'o', 't', 's', 'r', 'i', 'a']

  my_explorer = AnagramExplorer(words2)

  #print(my_explorer.is_valid_anagram_pair(("rat", "tar"), letters))
  #print(my_explorer.is_valid_anagram_pair(("stop", "pots"), letters))
  #print(my_explorer.get_most_anagrams(letters))
  print(my_explorer.get_all_anagrams(letters))