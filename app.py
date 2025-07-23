from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins = ["https://chen-k-06.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

#------------------------------------------------
#------------------------------------------------
# ANAGAME 
#------------------------------------------------
#------------------------------------------------

from AnagramExplorer import AnagramExplorer
from valid_anagame_words import get_valid_word_list
from anagame import calc_stats, generate_letters
from typing import List, Tuple

#------------------------------------------------
# Calculate end of game statistics functions
#------------------------------------------------
class GetLetters(BaseModel):
    fun_factor: int
    distribution: str
    
@app.post("/anagame_get_letters")
def handle_get_letters(request: GetLetters) -> list[str]: 
    explorer = AnagramExplorer(get_valid_word_list())
    result = generate_letters(request.fun_factor, request.distribution, explorer)
    return result

#------------------------------------------------
# Calculate end of game statistics functions 
#------------------------------------------------
class CalcStats(BaseModel):
    guesses: List[Tuple[str, str]]
    letters: List[str]

class StatsResponse(BaseModel):
    valid_guesses: List[List[str]]
    invalid_guesses: List[List[str]]
    score: int
    accuracy: float
    skill: float
    guessed_words: List[str]
    not_guessed_words: List[str]

@app.post("/anagame_calc_stats", response_model=StatsResponse)
def handle_calc_stats(request: CalcStats) -> StatsResponse: 
    explorer = AnagramExplorer(get_valid_word_list())
    result = calc_stats(request.guesses, request.letters, explorer) #guesses needs to be tuples
        
    return StatsResponse(
        valid_guesses=result[0],
        invalid_guesses=result[1],
        score=result[2],
        accuracy=result[3],
        skill=result[4],
        guessed_words=result[5],
        not_guessed_words=result[6]
    )

#------------------------------------------------
# Get all anagrams (for hint)
#------------------------------------------------
class GetHint(BaseModel):
    letters: list[str]
    
@app.post("/anagame_get_hint")
def handle_get_letters(request: GetHint) -> str: 
    explorer = AnagramExplorer(get_valid_word_list())
    result = explorer.get_most_anagrams(request.letters)
    return result