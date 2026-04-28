from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import sqlite3
import re
import os

website = 'https://dcs.rutgers.edu/classrooms/find-a-classroom/table-mode' #DCS website
path = '/Users/martinshen/Documents/cs/CSL/scarletLabs/openClassroomTracker/src/webscrape/chromedriver'  

#creates a webdriver instance
driver = webdriver.Chrome()
driver.get(website)

#lists for storing data
increment = []
location_code = []
campus = []
building = []
titles = []


#gets all the rows in the table / info is not cleaned
matches = driver.find_elements(By.TAG_NAME, 'tr')

#gets the header row for db titles
header_row = driver.find_element(By.TAG_NAME, "tr")  
titles = [header.text.split("\n")[0].strip() 
          for header in header_row.find_elements(By.TAG_NAME, "th")]

#goes through table and stores data in lists
for match in matches:
    cells = match.find_elements(By.TAG_NAME, "td")  # get all cells in the row
    if len(cells) >= 1:
        increment.append(cells[0].text)
    if len(cells) >= 3:  # make sure there's a 3rd column
        location_code.append(cells[2].text)
    if len(cells) >= 4:  # make sure there's a 4th column
        campus.append(cells[3].text)
    if len(cells) >= 5:  # make sure there's a 5th column
        building.append(cells[4].text)

prefixes = [re.match(r'^([^-\s]+)', code).group(1) for code in location_code]


data_dict = {}
for i in range(len(prefixes)):
    data_dict[prefixes[i]] = building[i]
print(data_dict)

script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, 'class_schedule.db')
connection = sqlite3.connect(db_path)
cursor = connection.cursor()
# Create table for classroom locations
cursor.execute("""
    CREATE TABLE IF NOT EXISTS RoomNames (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL
)
""")
#enter data into table
for code, name in data_dict.items():
    cursor.execute(
        "INSERT OR REPLACE INTO RoomNames (code, name) VALUES (?, ?)",
        (code, name)
    )

connection.commit()
connection.close()

print("RoomNames table updated successfully!")
