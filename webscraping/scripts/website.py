import json
import time
import random
import requests
from bs4 import BeautifulSoup
from pathlib import Path
import urllib.parse
import re
import os
import sys
import logging
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import pickle
import urllib3

# =================================================
# CONFIGURATION VARIABLES - Edit these as needed
# =================================================
# Base directory paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "logs"
# Create directories if they don't exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)

# File paths
UNIVERSITIES_JSON_PATH = DATA_DIR / "universities.json"
PROGRESS_FILE_PATH = LOG_DIR / "scraper_progress.pkl"
LOG_FILE_PATH = LOG_DIR / "website_scraper.log"
PROXIES_LIST_PATH = DATA_DIR / "proxies_list.txt"

# Request configuration
DEFAULT_TIMEOUT = 30  # Increased timeout for reliable connections
MAX_RETRIES = 3       # Reasonable number of retries
BACKOFF_FACTOR = 2    # Increased backoff factor for exponential delay between retries
BASE_RETRY_DELAY = 5  # Increased base delay between retries
SAVE_PROGRESS_INTERVAL = 5  # Save progress after processing this many universities

# Rate limiting
MIN_REQUEST_DELAY = 5  # Increased minimum delay between requests to avoid rate limiting
MAX_REQUEST_DELAY = 10  # Increased maximum delay between requests
 
# Proxy configuration
ALWAYS_USE_PROXY_FOR_USNEWS = True  # Always use a proxy when accessing usnews.com domains
PROXY_ROTATION_RETRIES = 5           # More reasonable number of different proxies to try before giving up

# =================================================
# Proxy and Request Configuration
# =================================================

# Disable warning about insecure requests (when using proxies)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE_PATH),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# List of free proxies - replace with your own proxies or proxy service
# Consider using a paid proxy service for better reliability
PROXY_LIST = [
    # Format: "http://username:password@ip:port" for authenticated proxies or
    # "http://ip:port" for free proxies
    "http://185.199.229.156:7492",
    "http://185.199.228.220:7300",
    "http://185.199.231.45:8382",
    "http://185.199.229.214:7044",
    "http://185.199.231.122:8382",
    # Add more proxies as needed
]

def load_proxies():
    """
    Load proxies from the proxies list file.
    Returns a list of proxy URLs.
    """
    if not PROXIES_LIST_PATH.exists():
        logger.warning(f"Proxies list file not found at {PROXIES_LIST_PATH}. Using default proxies.")
        return PROXY_LIST
    
    try:
        with open(PROXIES_LIST_PATH, 'r') as f:
            # Read lines and strip whitespace
            proxies = [line.strip() for line in f if line.strip() and not line.strip().startswith('#')]
        
        # Format proxies as needed (add http:// prefix if not present)
        formatted_proxies = []
        for proxy in proxies:
            if not proxy.startswith('http://') and not proxy.startswith('https://'):
                proxy = f"http://{proxy}"
            formatted_proxies.append(proxy)
        
        if not formatted_proxies:
            logger.warning("Proxies list file is empty. Using default proxies.")
            return PROXY_LIST
        
        logger.info(f"Loaded {len(formatted_proxies)} proxies from {PROXIES_LIST_PATH}")
        return formatted_proxies
    except Exception as e:
        logger.error(f"Error loading proxies from {PROXIES_LIST_PATH}: {str(e)}")
        return PROXY_LIST

# Load proxies from file
PROXY_LIST = load_proxies()

def get_random_proxy():
    """Get a random proxy from the proxy list."""
    if not PROXY_LIST:
        return None
    return random.choice(PROXY_LIST)

# Comprehensive list of modern user agents for stable rotation
USER_AGENTS = [
    # Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    # Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    # Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    # Firefox on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    # Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    # Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
    # Mobile Chrome
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.0.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.0.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
]

def get_random_user_agent():
    """Get a random user agent from the predefined list."""
    return random.choice(USER_AGENTS)

def setup_requests_session():
    """
    Set up a requests session with retry capabilities.
    """
    session = requests.Session()
    retry_strategy = Retry(
        total=MAX_RETRIES,                    # Maximum number of retries from config
        status_forcelist=[429, 500, 502, 503, 504],  # Status codes to retry on
        allowed_methods=["GET"],
        backoff_factor=BACKOFF_FACTOR,        # Backoff factor from config
        respect_retry_after_header=True,
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    # Configure initial headers
    session.headers.update({
        'User-Agent': get_random_user_agent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'DNT': '1',  # Do Not Track
    })
    
    return session

def save_progress(index, universities):
    """
    Save current progress to a pickle file.
    """
    with open(PROGRESS_FILE_PATH, 'wb') as f:
        pickle.dump({'index': index, 'universities': universities}, f)
    logger.info(f"Progress saved at index {index}")

def load_progress():
    """
    Load progress from a pickle file if it exists.
    """
    if PROGRESS_FILE_PATH.exists():
        with open(PROGRESS_FILE_PATH, 'rb') as f:
            data = pickle.load(f)
            logger.info(f"Loaded progress from index {data['index']}")
            return data['index'], data['universities']
    return 0, None

def is_usnews_domain(url):
    """
    Check if a URL is from US News domain.
    """
    return 'usnews.com' in url

def get_usnews_data(session, url, university_name):
    """
    Special handler for US News domains - always uses proxies and implements
    additional protection against blocking.
    """
    if not is_usnews_domain(url):
        logger.warning(f"Non US News URL passed to get_usnews_data: {url}")
        return make_request(session, url, university_name)
    
    logger.info(f"Accessing US News data for {university_name} with protective measures")
    
    # Force proxy usage for US News domains
    original_proxies = session.proxies.copy() if hasattr(session, 'proxies') else {}
    original_headers = session.headers.copy()
    
    try:
        # Set random user agent
        session.headers.update({
            'User-Agent': get_random_user_agent(),
            # Add additional headers that make the request look more like a browser
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.google.com/search?q=' + urllib.parse.quote(university_name + ' ranking'),
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Connection': 'keep-alive',
        })
        
        # Always use a proxy with US News
        if not PROXY_LIST:
            logger.error(f"Cannot access US News data for {university_name} - no proxies available")
            return None
        
        # Try each proxy for US News
        for attempt in range(PROXY_ROTATION_RETRIES):
            # Get a random proxy
            proxy = get_random_proxy()
            session.proxies = {'http': proxy, 'https': proxy}
            
            logger.info(f"Accessing US News with proxy {proxy} for {university_name} (attempt {attempt+1})")
            
            try:
                # Make the request with standard timeout
                response = session.get(url, timeout=DEFAULT_TIMEOUT, verify=False)
                
                if response.status_code == 200:
                    logger.info(f"Successfully accessed US News data for {university_name}")
                    return response
                elif response.status_code == 403:
                    logger.warning(f"Access forbidden (403) from US News for {university_name}. Trying different proxy.")
                    # Wait longer before next attempt
                    time.sleep(random.uniform(BASE_RETRY_DELAY * 2, BASE_RETRY_DELAY * 3))
                else:
                    logger.warning(f"Received status code {response.status_code} from US News for {university_name}")
                    time.sleep(random.uniform(BASE_RETRY_DELAY, BASE_RETRY_DELAY * 2))
            
            except Exception as e:
                logger.warning(f"Error accessing US News with proxy {proxy} for {university_name}: {str(e)}")
                time.sleep(random.uniform(BASE_RETRY_DELAY, BASE_RETRY_DELAY * 2))
        
        logger.error(f"Failed to access US News data for {university_name} after trying multiple proxies")
        return None
    
    finally:
        # Restore original session configuration
        session.proxies = original_proxies
        session.headers = original_headers

def make_request(session, url, university_name, max_retries=MAX_RETRIES, proxy_retries=PROXY_ROTATION_RETRIES):
    """
    Make a request with multiple retry strategies including proxy rotation.
    """
    # Setup a persistent list of proxies that have failed for this URL
    failed_proxies = set()
    
    # Check if this is a US News domain that requires proxy
    is_usnews_domain = 'usnews.com' in url
    requires_proxy = is_usnews_domain and ALWAYS_USE_PROXY_FOR_USNEWS
    
    for proxy_attempt in range(proxy_retries):
        # Rotate user agent for each attempt
        session.headers.update({'User-Agent': get_random_user_agent()})
        
        # Determine if we should use a proxy for this attempt
        use_proxy = requires_proxy or proxy_attempt > 0
        
        if use_proxy:
            # Use a random proxy from the list
            proxy = get_random_proxy()
            # Skip proxies that have already failed for this URL
            attempts = 0
            while proxy in failed_proxies and attempts < 10:
                proxy = get_random_proxy()
                attempts += 1
            # If we have a valid proxy, set it in the session
            if proxy and proxy not in failed_proxies:
                session.proxies = {'http': proxy, 'https': proxy}
                logger.info(f"Using proxy {proxy} for {university_name}" + (" (US News domain)" if is_usnews_domain else ""))
            else:
                logger.warning(f"No suitable proxy available for {university_name}" + 
                              (", but US News domain requires proxy!" if requires_proxy else ""))
                if requires_proxy:
                    logger.info("Waiting longer before retry due to missing proxy for US News domain")
                    time.sleep(random.uniform(BASE_RETRY_DELAY * 2, BASE_RETRY_DELAY * 3))
                session.proxies = {}
        else:
            session.proxies = {}  # First attempt without proxy unless forced
        
        for attempt in range(max_retries):
            try:
                # Set timeout from global configuration
                response = session.get(url, timeout=DEFAULT_TIMEOUT, verify=False)
                
                if response.status_code == 200:
                    return response
                elif response.status_code == 403:
                    logger.warning(f"Access forbidden (403) for {university_name}. Possibly blocked.")
                    # Wait longer before next attempt
                    time.sleep(random.uniform(BASE_RETRY_DELAY, BASE_RETRY_DELAY * 2))
                    # Add current proxy to failed list
                    if session.proxies and 'https' in session.proxies:
                        failed_proxies.add(session.proxies['https'])
                    break  # Break and try with a different proxy
                else:
                    logger.warning(f"Received status code {response.status_code} for {university_name}")
                    # Increase wait time for each attempt
                    delay = BASE_RETRY_DELAY * (BACKOFF_FACTOR ** attempt) + random.uniform(0, 5)
                    logger.info(f"Waiting {delay:.2f}s before retry")
                    time.sleep(delay)
            
            except (requests.exceptions.Timeout, requests.exceptions.ReadTimeout):
                logger.warning(f"Timeout on attempt {attempt+1} for {university_name}")
                # Increase wait time for each attempt
                delay = BASE_RETRY_DELAY * (BACKOFF_FACTOR ** attempt) + random.uniform(0, 5)
                logger.info(f"Waiting {delay:.2f}s before retry")
                time.sleep(delay)
                # Add current proxy to failed list if using one
                if session.proxies and 'https' in session.proxies:
                    failed_proxies.add(session.proxies['https'])
            
            except requests.exceptions.ConnectionError:
                logger.warning(f"Connection error on attempt {attempt+1} for {university_name}")
                delay = BASE_RETRY_DELAY * (BACKOFF_FACTOR ** attempt) + random.uniform(5, 15)
                logger.info(f"Waiting {delay:.2f}s before retry")
                time.sleep(delay)
                # Add current proxy to failed list if using one
                if session.proxies and 'https' in session.proxies:
                    failed_proxies.add(session.proxies['https'])
            
            except Exception as e:
                logger.error(f"Error on attempt {attempt+1} for {university_name}: {str(e)}")
                delay = BASE_RETRY_DELAY * (BACKOFF_FACTOR ** attempt) + random.uniform(0, 5)
                time.sleep(delay)
                # Add current proxy to failed list if using one
                if session.proxies and 'https' in session.proxies:
                    failed_proxies.add(session.proxies['https'])
    
    logger.error(f"Failed to access {url} for {university_name} after multiple attempts")
    return None

def extract_website_from_html(soup, university_name):
    """
    Extract the university's actual website URL from the US News HTML using multiple strategies.
    Returns the found URL or None if not found.
    """
    # Method 1: Look for "Visit School Website" with external-link icon
    website_links = soup.find_all('a', string=lambda text: text and 'Visit School Website' in text)
    
    # Method 2: Look for links with WebsiteAnchor class
    if not website_links:
        website_links = soup.find_all('a', class_=lambda x: x and 'WebsiteAnchor' in x)
    
    # Method 3: Look for any anchor with edu_profile_link data-tracking-id
    if not website_links:
        website_links = soup.find_all('a', attrs={'data-tracking-id': 'edu_profile_link'})
    
    # Method 4: Look for any anchor with target="_blank" containing "Visit" text
    if not website_links:
        website_links = soup.find_all('a', attrs={'target': '_blank'}, 
                                     string=lambda text: text and ('Visit' in text or 'Website' in text))
    
    # Method 5: Look specifically for usnews.com links that contain "visit-website"
    if not website_links:
        website_links = soup.find_all('a', href=lambda href: href and 'visit-website' in href)
    
    # Method 6: Find all links and look for university domain patterns
    if not website_links:
        all_links = soup.find_all('a', href=True)
        for link in all_links:
            href = link.get('href', '')
            # Look for .edu domains or typical university website patterns
            if re.search(r'(\.edu|university|college|\.ac\.|\.edu\.|school)', href, re.I):
                if not href.startswith('https://www.usnews.com'):
                    website_links = [link]
                    break
    
    # If we found a link, extract and clean its URL
    if website_links:
        website_url = website_links[0]['href']
        
        # Handle redirect links from US News (often used for tracking clicks)
        if 'usnews.com' in website_url and 'visit-website' in website_url:
            # Try to extract the actual URL from the redirect parameter
            parsed_url = urllib.parse.urlparse(website_url)
            query_params = urllib.parse.parse_qs(parsed_url.query)
            if 'url' in query_params:
                website_url = query_params['url'][0]
                logger.info(f"Extracted redirect URL for {university_name}: {website_url}")
        
        # Clean the URL (remove tracking parameters if needed)
        clean_url = website_url.split('?')[0]
        logger.info(f"Found website for {university_name}: {clean_url}")
        return clean_url
    
    logger.warning(f"Could not find website link for {university_name}")
    return None

def extract_university_websites():
    """
    Extracts actual university website URLs from US News pages and updates the universities.json file.
    """
    # Load the universities JSON file
    json_path = UNIVERSITIES_JSON_PATH
    with open(json_path, 'r') as f:
        universities = json.load(f)
    
    # Check if we have saved progress
    start_index, saved_universities = load_progress()
    if saved_universities:
        universities = saved_universities
    
    # Create requests session with retry capabilities
    session = setup_requests_session()
    
    # Process each university, starting from the saved index
    for i in range(start_index, len(universities)):
        university = universities[i]
        
        if i > 0 and i % SAVE_PROGRESS_INTERVAL == 0:
            logger.info(f"Processed {i} universities")
            save_progress(i, universities)  # Save progress at regular intervals
        
        try:
            # Get the URL from the university data
            url = university.get('website', '')
            university_name = university.get('name', f'University {i}')
            
            # Skip if missing URL
            if not url:
                logger.info(f"Skipping {university_name} - missing URL")
                continue
            
            # Add a random delay to avoid being blocked
            delay = random.uniform(MIN_REQUEST_DELAY, MAX_REQUEST_DELAY)
            logger.info(f"Processing {university_name} (waiting {delay:.2f}s)")
            time.sleep(delay)
            
            # Check if this is a US News domain
            if is_usnews_domain(url):
                logger.info(f"Using specialized US News handler for {university_name}")
                
                # Use the dedicated US News handler
                response = get_usnews_data(session, url, university_name)
            else:
                # For non-US News domains, use the regular request handler
                response = make_request(session, url, university_name)
            
            if not response:
                logger.warning(f"Failed to get response for {university_name}, will try again later")
                continue
            
            # Parse the HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Only extract website if this is a US News URL
            if is_usnews_domain(url):
                # Extract website using multiple strategies
                website_url = extract_website_from_html(soup, university_name)
                
                if website_url:
                    # Update the university data with the actual university website
                    university['website'] = website_url
                    logger.info(f"Updated website for {university_name}: {website_url}")
                else:
                    logger.warning(f"Could not find website link for {university_name}")
            else:
                # For non-US News URLs, possibly extract other data here in the future
                logger.info(f"Processed non-US News URL for {university_name}")
        
        except KeyboardInterrupt:
            logger.warning("Script interrupted by user. Saving progress...")
            save_progress(i, universities)
            # Save the updated universities data
            with open(json_path, 'w') as f:
                json.dump(universities, f, indent=4)
            logger.info("Data saved. Exiting.")
            return
        
        except Exception as e:
            logger.error(f"Error processing {university['name']}: {str(e)}")
            # Save progress more frequently when errors occur
            save_progress(i, universities)
    
    # Save the updated universities data
    with open(json_path, 'w') as f:
        json.dump(universities, f, indent=4)
    
    # Delete progress file when complete
    if PROGRESS_FILE_PATH.exists():
        os.remove(PROGRESS_FILE_PATH)
    
    logger.info(f"Completed updating university websites. Total universities processed: {len(universities)}")

if __name__ == "__main__":
    try:
        extract_university_websites()
    except KeyboardInterrupt:
        logger.warning("Script terminated by user.")
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}")
