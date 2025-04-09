import json
import time
import random
import requests
from bs4 import BeautifulSoup
from pathlib import Path
import urllib.parse
import re
import os

# Path to the universities data file
DATA_PATH = Path(__file__).parent.parent / "data" / "universities.json"

# Cookies and sessions directory for persistence
SESSIONS_DIR = Path(__file__).parent / "sessions"
SESSIONS_DIR.mkdir(exist_ok=True)
COOKIES_FILE = SESSIONS_DIR / "google_cookies.json"

# Rotating User Agents to appear more human-like
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0"
]

# Base headers for requests
def get_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.google.com/",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document"
    }

def create_persistent_session():
    """
    Create a session with loaded cookies if available.
    """
    session = requests.Session()
    
    # Load cookies if available
    if COOKIES_FILE.exists():
        try:
            with open(COOKIES_FILE, 'r') as f:
                cookies = json.load(f)
                session.cookies.update(cookies)
                print(f"Loaded {len(cookies)} cookies from previous session")
        except json.JSONDecodeError:
            print("Could not load cookies, starting with fresh session")
    
    return session

def save_session_cookies(session):
    """
    Save session cookies for future use
    """
    cookies_dict = {cookie.name: cookie.value for cookie in session.cookies}
    with open(COOKIES_FILE, 'w') as f:
        json.dump(cookies_dict, f)
    print(f"Saved {len(cookies_dict)} cookies for future use")

def extract_url_from_google_redirect(href):
    """
    Extract the actual URL from Google's redirect URL.
    """
    if href.startswith('/url?'):
        try:
            # Try the regex pattern first
            match = re.search(r'url\?q=([^&]+)', href)
            if match:
                return urllib.parse.unquote(match.group(1))
            
            # If that fails, try parsing the query parameters
            parsed = urllib.parse.urlparse(href)
            query_params = urllib.parse.parse_qs(parsed.query)
            if 'q' in query_params:
                return query_params['q'][0]
        except Exception as e:
            print(f"Error extracting URL from redirect: {e}")
    
    # Return the original URL if it's not a Google redirect or extraction failed
    return href

def handle_redirect_wait_page(session, response):
    """
    Handle Google's "please wait for redirect" page
    """
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Check if it's a redirect wait page
    if 'If you\'re having trouble accessing Google Search' in response.text:
        print("Detected 'waiting for redirect' page")
        
        # Try to find the redirect URL in script tags
        script_tags = soup.find_all('script')
        for script in script_tags:
            if script.string and 'location.replace' in script.string:
                redirect_match = re.search(r'location\.replace\([\'"]([^\'"]+)[\'"]\)', script.string)
                if redirect_match:
                    redirect_url = redirect_match.group(1)
                    print(f"Found redirect URL in script: {redirect_url}")
                    return redirect_url
        
        # Look for the continue link
        continue_links = soup.select('a[href*="enablejs"]')
        if continue_links:
            href = continue_links[0]['href']
            full_url = urllib.parse.urljoin("https://www.google.com", href)
            print(f"Found continue link: {full_url}")
            return full_url
        
        # Look for any link that might continue the process
        links = soup.find_all('a')
        for link in links:
            if 'click here' in link.text.lower():
                href = link.get('href', '')
                full_url = urllib.parse.urljoin("https://www.google.com", href)
                print(f"Found 'click here' link: {full_url}")
                return full_url
    
    return None

def follow_redirect(session, url, max_retries=5, timeout=30):
    """
    Follow a URL through any redirects to get the final destination URL.
    Implements retry logic and proper delays.
    """
    current_url = url
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            print(f"Following URL: {current_url}")
            
            # Make the request with a longer timeout
            response = session.get(
                current_url, 
                headers=get_headers(), 
                allow_redirects=True,
                timeout=timeout
            )
            response.raise_for_status()
            
            # Check if we're on a Google redirect waiting page
            redirect_url = handle_redirect_wait_page(session, response)
            if redirect_url:
                current_url = redirect_url
                # Add a longer delay when handling redirect pages to let Google know we're patient
                delay = random.uniform(5.0, 10.0)
                print(f"Waiting {delay:.2f} seconds before following redirect...")
                time.sleep(delay)
                continue
            
            # A normal human delay between requests
            delay = random.uniform(2.0, 5.0)
            print(f"Waiting {delay:.2f} seconds to simulate human browsing...")
            time.sleep(delay)
            
            final_url = response.url
            print(f"Final URL after redirect: {final_url}")
            
            # If we end up with the same URL or a Google URL, this might indicate a problem
            if final_url == current_url or 'google.com' in final_url:
                # Try to extract the URL from the HTML if it's a Google redirect page
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Look for meta refresh redirects
                meta_refresh = soup.find('meta', attrs={'http-equiv': 'refresh'})
                if meta_refresh and 'content' in meta_refresh.attrs:
                    content = meta_refresh['content']
                    url_match = re.search(r'URL=\'?([^\'\s]+)\'?', content, re.IGNORECASE)
                    if url_match:
                        extracted_url = url_match.group(1)
                        print(f"Found meta refresh redirect to: {extracted_url}")
                        current_url = extracted_url
                        retry_count += 1
                        continue
                
                # Look for JavaScript redirects in the page
                js_redirect = re.search(r'window\.location(?:\.href)?\s*=\s*[\'"]([^\'"]+)[\'"]', response.text)
                if js_redirect:
                    extracted_url = js_redirect.group(1)
                    print(f"Found JavaScript redirect to: {extracted_url}")
                    current_url = extracted_url
                    retry_count += 1
                    continue
            
            # Success - we have a final URL
            return final_url
            
        except requests.RequestException as e:
            print(f"Error following redirect (attempt {retry_count+1}/{max_retries}): {e}")
            retry_count += 1
            # Exponential backoff
            delay = 3 * (2 ** retry_count) + random.uniform(1.0, 5.0)
            print(f"Waiting {delay:.2f} seconds before retrying...")
            time.sleep(delay)
    
    # If we've exhausted retries, return the original URL
    print(f"Failed to follow redirect after {max_retries} attempts, returning original URL")
    return url

def search_google(query, session):
    """
    Search Google for the given query and return the first link.
    """
    search_url = f"https://www.google.com/search?q={urllib.parse.quote_plus(query)}"
    try:
        # Initial search request with a longer timeout
        print(f"Searching Google for: {query}")
        response = session.get(search_url, headers=get_headers(), timeout=30)
        response.raise_for_status()
        
        # Check if we're on a redirect waiting page
        redirect_url = handle_redirect_wait_page(session, response)
        if redirect_url:
            print(f"Following redirect wait page link: {redirect_url}")
            response = session.get(redirect_url, headers=get_headers(), timeout=30)
            response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try different selectors for Google search results
        selectors = [
            'a.zReHs',              # Current selector observed
            '.yuRUbf a',            # Common selector
            '.tF2Cxc a',            # Another common selector
            '.DKV0Md',              # Common title class
            'div.g a',              # Generic result container
            '.g .yuRUbf a',         # Another structure
            'a h3',                 # Any link with h3 inside (search result title)
            '.LC20lb'               # Result title class
        ]
        
        links = []
        for selector in selectors:
            if selector == 'a h3':
                # Special case for finding links that contain h3 elements
                links = [a for a in soup.select('a') if a.select_one('h3')]
            elif selector == '.LC20lb':
                # Special case for finding LC20lb title elements and their parent links
                titles = soup.select('.LC20lb')
                links = []
                for title in titles:
                    parent_link = title.find_parent('a')
                    if parent_link:
                        links.append(parent_link)
            else:
                links = soup.select(selector)
            
            if links:
                print(f"Found {len(links)} links using selector: {selector}")
                break
        
        # Save search results HTML for debugging
        debug_file = Path(__file__).parent / f"google_search_{query.replace(' ', '_').lower()[:30]}.html"
        with open(debug_file, "w", encoding="utf-8") as f:
            f.write(response.text)
        print(f"Saved search results HTML to {debug_file}")
        
        # Process the found links
        for link in links:
            if 'href' in link.attrs:
                href = link['href']
                
                # Handle Google's redirect URL format
                if href.startswith('/url?') or 'google.com/url' in href:
                    href = extract_url_from_google_redirect(href)
                
                # Skip if it's still a Google-specific link
                if 'google.com' in href:
                    continue
                
                # Print the link text for debugging
                link_text = link.get_text().strip()
                print(f"Found link: {link_text} -> {href}")
                
                # Follow the link to get the final URL after redirect
                try:
                    final_url = follow_redirect(session, href)
                    if final_url:
                        return final_url
                except Exception as e:
                    print(f"Error following URL {href}: {e}")
        
        print(f"No suitable links found for query: {query}")
        return None
    
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return None

def update_university_websites():
    """
    Update the university website URLs with links to their graduate programs.
    """
    # Load the existing university data
    try:
        with open(DATA_PATH, 'r') as file:
            universities = json.load(file)
    except Exception as e:
        print(f"Error loading university data: {e}")
        return
    
    # Create a persistent session
    session = create_persistent_session()
    
    try:
        # Update each university website
        updated_count = 0
        for i, university in enumerate(universities):
            name = university["name"]
            search_query = f"{name} graduate programs official site"
            
            print(f"\n({i+1}/{len(universities)}) Searching for: {search_query}")
            
            # Search Google for the university's graduate programs
            grad_website = search_google(search_query, session)
            
            if grad_website:
                # Only update if we found a non-USNews URL (the current data has USNews URLs)
                if 'usnews.com' in university["website"] and 'usnews.com' not in grad_website:
                    university["website"] = grad_website
                    updated_count += 1
                    print(f"✓ Updated website for {name}: {grad_website}")
                else:
                    print(f"✗ Keeping existing website for {name}: {university['website']}")
            
            # Save after each update to preserve progress
            try:
                with open(DATA_PATH, 'w') as file:
                    json.dump(universities, file, indent=4)
                if grad_website:
                    print(f"Progress saved: {updated_count}/{i+1} universities updated")
            except Exception as e:
                print(f"Error saving progress: {e}")
            
            # Random delay to avoid rate limiting (longer delay to prevent blocking)
            delay = random.uniform(8.0, 15.0)
            print(f"Waiting {delay:.2f} seconds before next search...")
            time.sleep(delay)
    finally:
        # Always save cookies before exiting
        save_session_cookies(session)
    
    # Final save
    try:
        with open(DATA_PATH, 'w') as file:
            json.dump(universities, file, indent=4)
        print(f"Successfully updated {updated_count} university websites")
    except Exception as e:
        print(f"Error saving updated university data: {e}")

if __name__ == "__main__":
    print("Starting university website update...")
    update_university_websites()
    print("University website update complete.")
