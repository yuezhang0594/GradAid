import json
from bs4 import BeautifulSoup

def html_to_json(html_content):
    """
    Converts HTML table data to a JSON format based on the specified pattern.

    Args:
        html_content (str): The HTML content containing the table.

    Returns:
        str: JSON string representing the extracted data.
    """

    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table', {'id': 'search-content'})
    rows = table.find_all('tr', {'class': 'search-table__TableRow-sc-8xxgib-5'})

    data = []
    for row in rows:
        cells = row.find_all('td')
        if len(cells) >= 4:  # Ensure there are enough cells to extract data
            name_element = cells[0].find('a', class_='Anchor-byh49a-0')
            name = name_element.text.strip() if name_element else None
            
            city_element = cells[0].find('p', class_='Paragraph-sc-1iyax29-0')
            city_state = city_element.text.strip().split(', ') if city_element else ['', '']
            city = city_state[0]
            state = city_state[1] if len(city_state) > 1 else ''
            country = "USA"

            ranking_element = cells[0].find('div', class_='RankList__Rank-sc-2xewen-2')
            if ranking_element:
                ranking_text = ranking_element.text.replace('#', '').strip()
                if ranking_text == "Unranked":
                    ranking = None
                elif '-' in ranking_text:
                    # Handle ranking ranges by using the first number
                    ranking = int(ranking_text.split('-')[0])
                else:
                    try:
                        ranking = int(ranking_text)
                    except ValueError:
                        ranking = None
            else:
                ranking = None

            website = name_element['href'] if name_element else None

            data.append({
                "name": name,
                "location": {
                    "city": city,
                    "state": state,
                    "country": country,
                },
                "ranking": ranking,
                "website": website,
            })
    
    return json.dumps(data, indent=4)

# Load the HTML content from the file
with open('webscraping/data/usnews.htm', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Save the JSON output to a file
json_output = html_to_json(html_content)
with open('webscraping/data/universities.json', 'w', encoding='utf-8') as f:
    f.write(json_output)
print(f"University data saved to 'webscraping/data/universities.json'")