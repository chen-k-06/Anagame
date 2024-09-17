import time
import random
from valid_anagame_words import get_valid_word_list
from AnagramExplorer import AnagramExplorer

def generate_letters(fun_factor: int, distribution: str, explorer:AnagramExplorer) -> list:
   '''Generates a list of 7 randomly-chosen lowercase letters which can form at least 
      fun_factor unique anagramable words.


         Args:
          fun_factor (int): minimum number of unique anagram words offered by the chosen letters
          distribution (str): The type of distribution to use in order to choose letters
                "uniform" - chooses letters based on a uniform distribution, with replacement
                "scrabble" - chooses letters based on a scrabble distribution, without replacement
          explorer (AnagramExplorer): helper object used to facilitate computing anagrams based on specific letters.
         
         Returns:
             set: A set of 7 lowercase letters

         Example
         -------
         >>> explorer = AnagramExplorer(get_valid_word_list())
         >>> generate_letters(75, "scrabble", explorer)
         ["p", "o", "t", "s", "r", "i", "a"] 
   '''
   letters = ["p", "o", "t", "s", "r", "i", "a"]   # Tip: Start with a consistent list of letters for testing purposes
   ### BEGIN SOLUTION
   
   fun_factor_achieved = False

   while (fun_factor_achieved == False):
    if distribution == "uniform":
        uniform_distribution = "abcdiefghjklmnopqrstuvwxyz"
        uniform_distribution = list(uniform_distribution)
        for i in range(7):
           letters[i] = uniform_distribution[int(random.random()*25)]

    elif distribution == "scrabble":
        scrabble_distribution = "aaaaaaaaabbccddddeeeeeeeeeeeeffggghhiiiiiiiiijkllllmmnnnnnnooooooooppqrrrrrrssssttttttuuuuvvwwxyyz"
        scrabble_distribution = list(scrabble_distribution)
        for i in range(7):
            index = int(random.random()*len(scrabble_distribution) - 1)
            letters[i] = scrabble_distribution[index]
            scrabble_distribution.remove(scrabble_distribution[index])
    
    if (fun_factor <= len(explorer.get_all_anagrams(letters))):
       fun_factor_achieved = True

       
   ### END SOLUTION 
   
   return letters


def parse_guess(guess:str) -> tuple:
   '''Splits an entered guess into a two word tuple with all white space removed

        Args:
            guess (str): A single string reprsenting the player guess

        Returns:
            tuple: A tuple of two words. ("", "") in case of invalid input.

        Examples
        --------
        >>> parse_guess("eat, tea")
        ("eat", "tea")

        >>> parse_guess("eat , tea")
        ("eat", "tea")

        >>> parse_guess("eat,tea")
        ("eat", "tea")

        >>> parse_guess("eat tea")
        ("", "")
   '''
   ### BEGIN SOLUTION
   if "," in guess:
    if guess.count(",") > 1:
        return ("", "")
    array = guess.split(",")

   else: 
      return ("", "")

   for i in range(len(array)): 
      array[i] = array[i].replace(",", "")
      array[i] = array[i].replace(" ", "")

   return tuple(array)

   ### END SOLUTION 

def play_game(time_limit: int, letters: list, explorer:AnagramExplorer) -> list:
    '''Plays a single game of AnaGame

       Args:
         time_limit: Time limit in seconds
         letters: A list of valid letters from which the player can create an anagram
         explorer (AnagramExplorer): helper object used to compute anagrams of letters.

       Returns:
          A list of tuples reprsenting all player guesses
   '''
    guesses = [] 
    quit = False

    start = time.perf_counter() #start the stopwatch (sec)
    stop = start + time_limit

    while time.perf_counter() < stop and not quit:
        guess = input('')
        if guess.strip() == "quit":
            quit = True
        elif guess.strip() == "hint":
            print(f"Try working with: {explorer.get_most_anagrams(letters)}")
        else:
          tuple_guess = parse_guess(guess)
          if len(tuple_guess[0]) > 1:
            guesses.append(tuple_guess)
          else:
            print("Invalid input")

        print(f"{letters} {round(stop - time.perf_counter(), 2)} seconds left")

    return guesses
   
   
def calc_stats(guesses: list, letters: list, explorer) -> dict:
    '''Aggregates several statistics into a single dictionary with the following key-value pairs:
        "valid" - list of valid guesses
        "invalid" - list of invalid/duplicate guesses
        "score" - per the rules of the game
        "accuracy" -  truncated int percentage representing valid player guesses out of all player guesses
                      3 valid and 5 invalid guesses would result in an accuracy of 37 --> 3/8 = .375
        "guessed" - set of unique words guessed from valid guesses
        "not guessed" - set of unique words not guessed
        "skill" - truncated int percentage representing the total number of unique anagram words guessed out of all possible unique anagram words
                  Guessing 66 out of 99 unique words would result in a skill of 66 --> 66/99 = .66666666
     Args:
      guesses (list): A list of tuples representing all word pairs guesses by the user
      letters (list): The list of valid letters from which user should create anagrams
      explorer (AnagramExplorer): helper object used to compute anagrams of letters.

     Returns:
      dict: Returns a dictionary with seven keys: "valid", "invalid", "score", "accuracy", "guessed", "not guessed", "skill"
    
     Example
     -------
     >>> letters = ["p", "o", "t", "s", "r", "i", "a"]
     >>> guesses = [("star","tarts"),("far","rat"),("rat","art"),("rat","art"),("art","rat")]
     >>> explorer = AnagramExplorer(get_valid_word_list())
     >>> calc_stats(guesses, letters, explorer)
     {
        "valid":[("rat","art")],
        "invalid":[("star","tarts"),("far","rat"),("rat","art"),("art","rat")],
        "score": 1,
        "accuracy": 20,
        "guessed": { "rat", "art" },
        "not_guessed": { ...73 other unique },
        "skill": 2
     }
    '''
    stats = {}
    stats["valid"] = []   #list of tuples
    stats["invalid"] = [] #list of tuples
    stats["score"] = 0    #total score per the rules of the game
    stats["accuracy"] = 0 #truncated int percentage representing valid player guesses out of all player guesses
    stats["skill"] = 0    #truncated int percentage representing unique guessed words out of all possible unique anagram words
    stats["guessed"] = set() #unique valid guessed words
    stats["not guessed"] = set() #unique words the player could have guessed, but didn’t
    ### BEGIN SOLUTION

    valid_word_list = get_valid_word_list() # all valid words, regardless of what letters they contain

    for guess in guesses: 
       if len(guess) == 2 and explorer.is_valid_anagram_pair((guess[0], guess[1]), letters) and sorted(guess) not in stats["valid"]:
            stats["valid"].append(sorted(guess))

       else: 
          stats["invalid"].append(guess)

    if len(guesses) == 0: 
       stats["accuracy"]
    
    else:
        stats["accuracy"] = int ((len(stats["valid"]) / len(guesses)) * 100)

    for pair in stats["valid"]:
       for word in pair: 
          stats["guessed"].add(word)

    stats["not guessed"] = explorer.get_all_anagrams(letters)

    guessed_words = set()

    for word in stats["not guessed"]:
       if word in stats["guessed"]:
          guessed_words.add(word)

    for word in guessed_words: 
       stats["not guessed"].remove(word)
       
    stats["not guessed"] = list(filter(lambda item: item is not None, stats["not guessed"]))
    stats["not guessed"] =  set(stats["not guessed"])

    print(len(stats["not guessed"]))

    if len(explorer.get_all_anagrams(letters)) == 0:
       stats["skill"] = 0

    else: 
        stats["skill"] = int((len(stats["guessed"]) / len(explorer.get_all_anagrams(letters))) * 100)

    for pair in stats["valid"]: 
       if len(pair[0]) == 3:
            stats["score"] += 1
        
       elif len(pair[0]) == 4:
            stats["score"] += 2

       elif len(pair[0]) == 5:
            stats["score"] += 3    

       elif len(pair[0]) == 6:
            stats["score"] += 3

       elif len(pair[0]) == 7:
            stats["score"] += 5

    return stats
        
    ### END SOLUTION 

def display_stats(stats):
    '''Prints a string representation of the game results

        Args:
          score_info (dict): a dictionery of game play information
    '''
    
    print("\nThanks for playing Anagame!\n")
    print("------------")
    print(f"Accuracy: {round(stats['accuracy'], 2)}%")
    print(f" valid guesses ({len(stats['valid'])}):", end=" ")
    for guess in stats['valid']:
        print(f"  {guess[0]},{guess[1]}", end=" ")
    print(f"\n invalid guesses ({len(stats['invalid'])}):", end=" ")
    for guess in stats['invalid']:
        print(f"  {guess[0]},{guess[1]}", end=" ")
    print("\n------------")
    print(f"Skill: {stats['skill']}% ")
    print(f" Unique words used:", end=" ")
    for guess in sorted(stats['guessed']):
        print(f"  {guess}", end=" ")
    print(f"\n Words you could have used:", end=" ")
    for guess in sorted(stats['not guessed']):
        print(f"  {guess}", end=" ")
    print("\n------------")
    print(f"AnaGame - Final Score: {stats['score']}")
    print("------------")


if __name__ == "__main__":

  time_limit = 60

  explorer = AnagramExplorer(get_valid_word_list()) #helper object
  letters = generate_letters(100, "uniform", explorer)

  print("\nWelcome to Anagame!\n")
  print("Please enter your anagram guessess separated by a comma: eat,tea")
  print("Enter 'quit' to end the game early, or 'hint' to get a useful word!\n")
  print(f"You have {time_limit} seconds to guess as many anagrams as possible!")
  print(f"{letters}")

  guesses = play_game(time_limit, letters, explorer)
  stats_dict = calc_stats(guesses, letters, explorer)
  display_stats(stats_dict)
  
  