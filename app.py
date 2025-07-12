#api calls
from AnagramExplorer import AnagramExplorer
from valid_anagame_words import get_valid_word_list
from anagame import calc_stats, generate_letters
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chen-k-06.github.io"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

#------------------------------------------------
# Calculate end of game statistics functions
#------------------------------------------------
class GetLetters(BaseModel):
    distribution: list[str]
    fun_factor: int
    
@app.post("/get_letters")
def handle_get_letters(request: GetLetters) -> list[str]: 
    explorer = AnagramExplorer(get_valid_word_list())
    result = generate_letters(request.fun_factor, request.distribution, explorer)
    return result

#------------------------------------------------
# Calculate end of game statistics functions 
#------------------------------------------------
class CalcStats(BaseModel):
    guesses: list[str]
    letter: list[str]

@app.post("/calc_stats")
def handle_calc_stats(request: CalcStats) -> list[str]: 
    explorer = AnagramExplorer(get_valid_word_list())
    result = calc_stats(request.guesses, request.letter, explorer)
    return result

#------------------------------------------------
# Get all anagrams (for hint)
#------------------------------------------------