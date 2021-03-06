---
layout: post
title:  Scraping Information About Chopped Episodes
tags:
- BeautifulSoup
- Webscraping
---


This post is part of a project to visualize the ingredients used in the TV show Chopped. In order to do that, I need to first get a list of those ingredients. Luckily, that information exists on Wikipedia: <a href="https://en.wikipedia.org/wiki/List_of_Chopped_episodes">List of Chopped episodes</a>. Below I use BeautifulSoup to scrape the information and put it into a usable format. First, I'll import the packages I need and initialize an empty dictionary to put the information into.


```python
# Import necessary packages
from urllib.request import urlopen
from bs4 import BeautifulSoup as bs
import pandas as pd
import os
import csv
import pickle
```


```python
# Initialize dictionary
chopped_episodes = {'season':[], 'episode':[], 'title':[], 'airdate':[], 'appetizer':[], 'entree':[], 'dessert':[], 'judges':[], 'contestants':[]}
```

Next, I'll use BeautifulSoup to grab the HTML from the list of Chopped episodes and extract the information I want.


```python
# Grab the contents of the page from wikipedia.
s = urlopen('https://en.wikipedia.org/wiki/List_of_Chopped_episodes').read()
soup = bs(s.decode('utf-8', 'ignore'), 'html.parser')
```

Let's see what what the first bit looks like:


```python
print(soup.prettify()[0:2000])
```

    <!DOCTYPE html>
    <html class="client-nojs" dir="ltr" lang="en">
     <head>
      <meta charset="utf-8"/>
      <title>
       List of Chopped episodes - Wikipedia
      </title>
      <script>
       document.documentElement.className = document.documentElement.className.replace( /(^|\s)client-nojs(\s|$)/, "$1client-js$2" );
      </script>
      <script>
       (window.RLQ=window.RLQ||[]).push(function(){mw.config.set({"wgCanonicalNamespace":"","wgCanonicalSpecialPageName":false,"wgNamespaceNumber":0,"wgPageName":"List_of_Chopped_episodes","wgTitle":"List of Chopped episodes","wgCurRevisionId":804916026,"wgRevisionId":804916026,"wgArticleId":24971719,"wgIsArticle":true,"wgIsRedirect":false,"wgAction":"view","wgUserName":null,"wgUserGroups":["*"],"wgCategories":["Articles to be split from November 2016","All articles to be split","Lists of food television series episodes"],"wgBreakFrames":false,"wgPageContentLanguage":"en","wgPageContentModel":"wikitext","wgSeparatorTransformTable":["",""],"wgDigitTransformTable":["",""],"wgDefaultDateFormat":"dmy","wgMonthNames":["","January","February","March","April","May","June","July","August","September","October","November","December"],"wgMonthNamesShort":["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"wgRelevantPageName":"List_of_Chopped_episodes","wgRelevantArticleId":24971719,"wgRequestId":"Wd6Z@QpAAEUAAHX9dfwAAAAV","wgIsProbablyEditable":true,"wgRelevantPageIsProbablyEditable":true,"wgRestrictionEdit":[],"wgRestrictionMove":[],"wgFlaggedRevsParams":{"tags":{}},"wgStableRevisionId":null,"wgWikiEditorEnabledModules":{"toolbar":true,"preview":false,"publish":false},"wgBetaFeaturesFeatures":[],"wgMediaViewerOnClick":true,"wgMediaViewerEnabledByDefault":false,"wgPopupsShouldSendModuleToUser":false,"wgPopupsConflictsWithNavPopupGadget":false,"wgVisualEditor":{"pageLanguageCode":"en","pageLanguageDir":"ltr","pageVariantFallbacks":"en","usePageImages":true,"usePageDescriptions":true},"wgPreferredVariant":"en","wgMFExpandAllSectionsUserOpti


As we can see, there's a lot in there that we don't care about. The next section will find everything we want to save and put it into the dictionary.

First, there's a table on the page for each season of the show (35 so far--I'm not including specials or Chopped Junior), so we need to loop through 35 tables. Some rows have only one cell and some have multiple, so the way I process a row will depend on which type of row it is.


```python
for i in range(1,36):
    table = soup.findAll('table')[i]
    rownum = 0
    for row in table.findAll('tr'):
        
        # Skip the header line of each table
        if rownum == 0:
            rownum += 1
            pass
        
        # The next row has four cells - grab the episode number, title, and airdate
        elif rownum==1 or rownum % 3 == 1:
            rownum += 1
            chopped_episodes['season'].append(i)
            
            for col, val in enumerate(row.findAll('td')):
                if col==1:
                    chopped_episodes['episode'].append(val.getText())
                elif col==2:
                    chopped_episodes['title'].append(val.getText())
                elif col==3:
                    chopped_episodes['airdate'].append(val.getText())
                else:
                    continue

        # This row has two cells - grab the ingredients and judges. Because each of those has multiple entries, create a list of each.
        elif rownum==2 or rownum % 3 == 2:
            rownum += 1
            colnum = 0
            for col in row.findAll('td'):
                colnum += 1
                list_elements = col.findAll('li')
                if colnum==1:
                    listnum = 0
                    for j in list_elements:
                        listnum += 1
                        if listnum==1:
                            app_list = []
                            for k in j.getText()[11:].split(', '):
                                app_list.append(k)
                            chopped_episodes['appetizer'].append(app_list)
                        elif listnum==2:
                            ent_list = []
                            for k in j.getText()[8:].split(', '):
                                ent_list.append(k)
                            chopped_episodes['entree'].append(ent_list)
                        else:
                            des_list = []
                            for k in j.getText()[9:].split(', '):
                                des_list.append(k)
                            chopped_episodes['dessert'].append(des_list)
                else:
                    list_elements = col.findAll('li')
                    judge_list = []
                    for j in list_elements:
                        judge_list.append(j.getText())
                    chopped_episodes['judges'].append(judge_list)
        
        # For the last line of the episode, create a list of the contestants            
        else:
            rownum += 1
            for col in row.findAll('td'):
                list_elements = col.findAll('li')
                cont_list = []
                for j in list_elements:
                    cont_list.append(j.getText())
                chopped_episodes['contestants'].append(cont_list)
```

Now that we have the information in the dictionary, we can easily convert it to a pandas dataframe and examine the first few lines.


```python
eps = pd.DataFrame.from_dict(chopped_episodes, orient='columns')
```


```python
eps.head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>airdate</th>
      <th>appetizer</th>
      <th>contestants</th>
      <th>dessert</th>
      <th>entree</th>
      <th>episode</th>
      <th>judges</th>
      <th>season</th>
      <th>title</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>January 13, 2009</td>
      <td>[baby octopus, bok choy, oyster sauce, smoked ...</td>
      <td>[Summer Kriegshauser, Private Chef and Nutriti...</td>
      <td>[prunes, animal crackers, cream cheese]</td>
      <td>[duck breast, green onions, ginger, honey]</td>
      <td>1</td>
      <td>[Marc Murphy, Alex Guarnaschelli, Aarón Sánchez]</td>
      <td>1</td>
      <td>"Octopus, Duck, Animal Crackers"</td>
    </tr>
    <tr>
      <th>1</th>
      <td>January 20, 2009</td>
      <td>[firm tofu, tomato paste, prosciutto]</td>
      <td>[Raymond Jackson, Private Caterer and Culinary...</td>
      <td>[phyllo dough, gorgonzola cheese, pineapple ri...</td>
      <td>[daikon, pork loin, Napa cabbage, Thai chiles,...</td>
      <td>2</td>
      <td>[Aarón Sánchez, Alex Guarnaschelli, Marc Murphy]</td>
      <td>1</td>
      <td>"Tofu, Blueberries, Oysters"</td>
    </tr>
    <tr>
      <th>2</th>
      <td>January 27, 2009</td>
      <td>[lump crab meat, dried shiitake mushrooms, pin...</td>
      <td>[Margaritte Malfy, Executive Chef and Co-owner...</td>
      <td>[brioche, cantaloupe, pecans, avocados]</td>
      <td>[ground beef, cannellini beans, tahini paste, ...</td>
      <td>3</td>
      <td>[Aarón Sánchez, Alex Guarnaschelli, Marc Murphy]</td>
      <td>1</td>
      <td>"Avocado, Tahini, Bran Flakes"</td>
    </tr>
    <tr>
      <th>3</th>
      <td>February 3, 2009</td>
      <td>[ground beef, wonton wrappers, cream of mushro...</td>
      <td>[Sean Chudoba, Executive Chef, Ayza Wine Bar, ...</td>
      <td>[maple syrup, black plums, almond butter, waln...</td>
      <td>[scallops, collard greens, anchovies, sour cream]</td>
      <td>4</td>
      <td>[Scott Conant, Amanda Freitag, Geoffrey Zakarian]</td>
      <td>1</td>
      <td>"Banana, Collard Greens, Grits"</td>
    </tr>
    <tr>
      <th>4</th>
      <td>February 10, 2009</td>
      <td>[watermelon, canned sardines, pepper jack chee...</td>
      <td>[John Keller, Personal Chef, New York, NY (eli...</td>
      <td>[flour tortillas, prosecco, Canadian bacon, ro...</td>
      <td>[beef shoulder, yucca, raisins, ancho chiles, ...</td>
      <td>5</td>
      <td>[Geoffrey Zakarian, Alex Guarnaschelli, Marc M...</td>
      <td>1</td>
      <td>"Yucca, Watermelon, Tortillas"</td>
    </tr>
  </tbody>
</table>
</div>



I'll need to do some more data wrangling later for the network analysis, but for now I'll pickle the dataframe to be able to pull it up later.


```python
with open('chopped-episodes.pickle', 'wb') as handle:
    pickle.dump(eps, handle)
```
