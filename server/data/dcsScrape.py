from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

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
print(titles)
#next up is to store in sql database