from selenium import webdriver
from selenium.webdriver.common.keys import Keys

import time
import csv
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import NoSuchElementException

from datetime import datetime, date, timedelta
#import pandas as pd
import pyautogui
import re

from webdriver_manager.chrome import ChromeDriverManager

option = webdriver.ChromeOptions()
#option.add_argument('disable-infobars')
option.add_experimental_option("useAutomationExtension", False)
option.add_experimental_option("excludeSwitches", ['enable-automation'])
driver= webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=option)


def check_exists(path):
    try:
        driver.find_element(By.CSS_SELECTOR, path)

    except NoSuchElementException:
        return False
    return True

def naver_finder(place, menu):
    search_term=place+' '+menu
    driver.get(f'https://map.naver.com/v5/search/{search_term}')
    driver.implicitly_wait(5)
    driver.maximize_window()

keyword_one = pyautogui.prompt("지역: ")
keyword_two = pyautogui.prompt("업종: ")
naver_finder(keyword_one,keyword_two)


def check_exists(path):
    try:
        driver.find_element(By.CSS_SELECTOR, path)

    except NoSuchElementException:
        return False
    return True

def search_finder(num):
    try:
        driver.find_element(By.XPATH, f'//*[@id="_pcmap_list_scroll_container"]/ul/li[{num}]/div[1]/a').click()
        time.sleep(3)
        return True
    except:
        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)
        return False

def search_details():
    driver.switch_to.default_content()
    time.sleep(1)
    
    detail_iframe=driver.find_element(By.ID, 'entryIframe')
    driver.switch_to.frame(detail_iframe)

    name=driver.find_element(By.XPATH,f'//*[@id="_title"]/span[1]').text
    address=driver.find_element(By.XPATH,f'//*[@id="app-root"]/div/div/div/div[6]/div/div[2]/div/div/div[1]/div/a/span[1]').text

    #score=driver.find_element(By.XPATH,f'//*[@id="app-root"]/div/div/div/div[2]/div[1]/div[2]/span[1]').text

    driver.execute_script("window.scrollTo(0,3000);")
    
    #처음 리뷰수가 3개밖에 안나오므로 '방문자 리뷰 더보기'를 클릭(moreReviewBtn)
    moreReviewBtn = driver.find_element(By.CSS_SELECTOR,
                                        '.place_section_content a.fvwqf')
    moreReviewBtn.click()
    time.sleep(2)


    #i번째 가게의 리뷰 1번째부터 20번째까지의 반복문
    for j in range(1,21):
        review=""

        #가게 리뷰가 10개까지만 보인다. 11번째 리뷰~20번째 리뷰를 보려고 '더보기'버튼을 클릭(moreReviewBtn2)
        if(j==11):
            moreReviewBtn2 = driver.find_element(By.CSS_SELECTOR,
                                                 '#app-root > div > div > div > div:nth-child(7) > div:nth-child(3) > div.place_section.lcndr > div.lfH3O > a')
            moreReviewBtn2.click()
            time.sleep(2)

        #리뷰가 긴 경우 ▽ 버튼을 눌러야 한다(moreReviewLoadBtn)
        moreReviewLoadBtn = driver.find_element(By.CSS_SELECTOR,
                                            f'#app-root > div > div > div > div:nth-child(7) > div:nth-child(3) > div.place_section.lcndr > div.place_section_content > ul > li:nth-child({j}) > div.ZZ4OK > a')
        moreReviewLoadBtn.click()
        time.sleep(1)

        #▽버튼을 누른후 리뷰를 선택한다
        review = driver.find_element(By.CSS_SELECTOR,f'#app-root > div > div > div > div:nth-child(7) > div:nth-child(3) > div.place_section.lcndr > div.place_section_content > ul > li:nth-child({j}) > div.ZZ4OK > a > span').text
        time.sleep(1)

        #리뷰 프린트
        print("\n")
        print(f'{j}번째 리뷰================================')
        print(review)
        csvWriter.writerow([name, address, review])

    driver.switch_to.default_content()

    print(f'name:{name} menu:{address}')

f = open(r"/Users/munju/Desktop/phoebe/cafe_review.csv", 'w', encoding='utf-8', newline='')
csvWriter = csv.writer(f)

for n in range(10):
    print(f'Search info: {n+1}')
    search_iframe=driver.find_element(By.ID,'searchIframe')
    driver.switch_to.frame(search_iframe)
    search_result = search_finder(n+1)

    if search_result==True:
        print("search==True")
        search_details()

            
f.close()   
