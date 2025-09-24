#Selenium Imports
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
#Beautiful Soup import 
from bs4 import BeautifulSoup 
#Time for timer at the end before closing
import time
#sqlite for storing data in database
import sqlite3
#Datetime for converting time to 24 hour format
import datetime
import os
 

driver = webdriver.Chrome() 
driver.get('https://classes.rutgers.edu/soc/#home');


WebDriverWait(driver, 20).until(
    EC.element_to_be_clickable((By.XPATH, '//*[@id="FALL_SPRING_1_TEXT"]'))
)

formBoxes = ['//*[@id="FALL_SPRING_1_TEXT"]', '//*[@id="div-location"]/ul/li[1]/label/span', '//*[@id="level_U"]', '//*[@id="level_G"]', '//*[@id="continueButton"]']

#Complete form to access all classes in New Brunswick
for box in formBoxes:
    selector = driver.find_element('xpath', box)
    selector.click()
#Form Submitted



selector = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, '//*[@id="school_search_id"]'))
)
selector.click() #Click on School/Unit



allClasses = []


#Created dropdown selector for repetitive use
dropdown = driver.find_element('xpath', '//*[@id="widget_dijit_form_FilteringSelect_1"]/div[1]/input')


#Iterate through each school/unit
for school in range(26):

    #Click on Dropdown
    dropdown.click()#Click on searchbar Dropdown
    
    

    try:
        option = WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.ID, f"dijit_form_FilteringSelect_1_popup{school}"))
    )
        #Click on each School
        option.click()

        #Wait until page is loaded before accessing data
        WebDriverWait(driver, 20).until(
            EC.visibility_of_element_located((By.ID, "courseDataParent"))
        )

        #Initialize html_content with current html
        html_content = driver.page_source

        #Initialize BeautifulSoup scraper
        soup = BeautifulSoup(html_content, 'html.parser')

        #Find spans of all rooms, hours, and days
        rooms = soup.find_all('span', class_='meetingTimeBuildingAndRoom')
        hours = soup.find_all('span', class_='meetingTimeHours')
        days= soup.find_all('span', class_= 'meetingTimeDay') 

        for iterator in range(len(rooms)):
            if(rooms[iterator].get_text(strip=True) != ""):
                timing = hours[iterator].get_text(strip=True)
                startTime = timing.split(' - ')[0]
                endTime = timing.split(' - ')[1]

                #Converting to 24 hour format
                start_24 = datetime.datetime.strptime(startTime, '%I:%M %p').strftime('%H:%M')
                end_24 = datetime.datetime.strptime(endTime, '%I:%M %p').strftime('%H:%M')

                #Making array of room, start time, end time, and day
                roomInfo = [rooms[iterator].get_text(strip=True), start_24, end_24, days[iterator].get_text(strip=True)]

                if roomInfo not in allClasses:

                    #Adding to allClasses array if not already added
                    allClasses.append(roomInfo)
                    print(roomInfo)


      
    

            











    except Exception as e:
        print(f"Error interacting with div: {e}")



time.sleep(1)#Just for visibility, seeing that everything is done before closing

driver.quit()

#Adding all data to database
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, 'class_schedule.db')
connection = sqlite3.connect(db_path)
cursor = connection.cursor()

cursor.execute('DROP TABLE IF EXISTS Schedule')

cursor.execute("""
CREATE TABLE Schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    day TEXT NOT NULL
)
""")

for entry in allClasses:
    cursor.execute("INSERT INTO Schedule (room, start_time, end_time, day) VALUES (?, ?, ?, ?)", entry)

connection.commit()
connection.close()

print("All data added to database")