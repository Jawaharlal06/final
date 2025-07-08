"""import os
import sys
import json
from serpapi import GoogleSearch

def google_search(query, api_key=None, num_results=10):
    api_key = api_key or os.getenv("SERPAPI_API_KEY")
    if not api_key:
        raise ValueError("SerpAPI API key is required.")

    params = {
        "engine": "google",
        "q": query,
        "api_key": api_key,
        "num": num_results
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    return {
        "organic_results": results.get("organic_results", []),
        "images_results": results.get("images_results", []),
        "video_results": results.get("video_results", [])
    }

def google_image_search(query, api_key=None, num_results=10):
    api_key = api_key or os.getenv("SERPAPI_API_KEY")
    params = {
        "engine": "google_images",
        "q": query,
        "api_key": api_key,
        "num": num_results
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    return {
        "images_results": results.get("images_results", [])
    }

def google_video_search(query, api_key=None, num_results=10):
    api_key = api_key or os.getenv("SERPAPI_API_KEY")
    params = {
        "engine": "google_videos",
        "q": query,
        "api_key": api_key,
        "num": num_results
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    return {
        "video_results": results.get("video_results", [])
    }

if __name__ == "__main__":
    try:
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Usage: serpapiScript.py <type> <query>"}))
            sys.exit(1)
        search_type = sys.argv[1]  # "all", "images", or "videos"
        query = sys.argv[2]
        if search_type == "images":
            results = google_image_search(query)
        elif search_type == "videos":
            results = google_video_search(query)
        else:
            results = google_search(query)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
        """

import os
import sys
import json
import requests
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SerpApiService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://serpapi.com/search"
    
    def get_articles(self, query: str, num_results, location: str = "India") -> List[Dict]:
        params = {
            "engine": "google_news",
            "q": query,
            "api_key": self.api_key,
            "num": num_results,
            "location": location
        }
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            self._process_articles(data)
            articles = self._process_articles(data)
            return articles[:num_results]
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching articles: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return []
    
    def get_images(self, query: str, num_results, safe_search: str = "active") -> List[Dict]:
        params = {
            "engine": "google_images",
            "q": query,
            "api_key": self.api_key,
            "num": num_results,
            "safe": safe_search,
            "ijn": 0
        }
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            images = self._process_images(data)
            return images[:num_results]
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching images: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return []
    
    def get_videos(self, query: str, num_results, duration: str = "any") -> List[Dict]:
        params = {
            "engine": "google_videos",
            "q": query,
            "api_key": self.api_key,
            "num": num_results,
            "duration": duration
        }
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            videos = self._process_videos(data)
            return videos[:num_results] 
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching videos: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return []
    
    def _process_articles(self, data: Dict) -> List[Dict]:
        processed_articles = []
        if "news_results" in data:
            for article in data["news_results"]:
                processed_article = {
                    "title": article.get("title", ""),
                    "link": article.get("link", ""),
                    "source": article.get("source", ""),
                    "position": article.get("position", 0)
                }
                processed_articles.append(processed_article)
        return processed_articles
    
    def _process_images(self, data: Dict) -> List[Dict]:
        processed_images = []
        if "images_results" in data:
            for image in data["images_results"]:
                processed_image = {
                    "title": image.get("title", ""),
                    "original": image.get("original", ""),
                    "thumbnail": image.get("thumbnail", ""),
                    "source": image.get("source", ""),
                    "link": image.get("link", ""),
                    "width": image.get("original_width", 0),
                    "height": image.get("original_height", 0),
                    "position": image.get("position", 0)
                }
                processed_images.append(processed_image)
        return processed_images
    
    def _process_videos(self, data: Dict) -> List[Dict]:
        processed_videos = []
        if "video_results" in data:
            for video in data["video_results"]:
                processed_video = {
                    "title": video.get("title", ""),
                    "link": video.get("link", ""),
                    "source": video.get("source", ""),
                    "duration": video.get("duration", ""),
                    "channel": video.get("channel", ""),
                    "position": video.get("position", 0)
                }
                processed_videos.append(processed_video)
        return processed_videos
    
    def search_all(self, query: str, articles_count: int = 10, images_count: int = 20, videos_count: int = 10) -> Dict:
        results = {
            "query": query,
            "articles": self.get_articles(query, articles_count),
            "images": self.get_images(query, images_count),
            "videos": self.get_videos(query, videos_count)
        }
        return results

# -------- CLI ENTRY POINT FOR NODE.JS INTEGRATION --------
if __name__ == "__main__":
    try:
        api_key = os.getenv("SERPAPI_API_KEY")
        if not api_key:
            print(json.dumps({"error": "SERPAPI_API_KEY not set in environment"}))
            sys.exit(1)
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Usage: serpapiScript.py <type> <query>"}))
            sys.exit(1)
        search_type = sys.argv[1].lower()  # "all", "articles", "images", "videos"
        query = sys.argv[2]
        service = SerpApiService(api_key)
        """if search_type == "articles":
            results = service.get_articles(query,num_results=5)
            print(json.dumps({"articles": results}))
        elif search_type == "images":
            results = service.get_images(query,num_results=5)
            print(json.dumps({"images": results}))
        elif search_type == "videos":
            results = service.get_videos(query,num_results=5)
            print(json.dumps({"videos": results}))
        else:  # "all"
            results = service.search_all(query,articles_count=5,images_count=5,videos_count=5)
            print(json.dumps(results))"""
        results = service.search_all(query,articles_count=5,images_count=5,videos_count=5)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)