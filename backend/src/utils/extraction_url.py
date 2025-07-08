import requests
import json
import re
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from typing import List, Dict, Any
import os
from datetime import datetime
import logging

class VideoContentAgent:
    def __init__(self, deepseek_api_key: str = None):
        """
        Initialize the AI Video Content Extraction Agent
        """
        self.deepseek_api_key = deepseek_api_key
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def extract_content_from_url(self, url: str) -> Dict[str, Any]:
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            content = {
                'url': url,
                'title': self._extract_title(soup),
                'text': self._extract_text(soup),
                'images': self._extract_images(soup, url),
                'videos': self._extract_videos(soup, url),
                'metadata': self._extract_metadata(soup),
                'type': self._determine_content_type(url, soup)
            }
            return content

        except Exception as e:
            self.logger.error(f"Error extracting content from {url}: {str(e)}")
            return {'url': url, 'error': str(e)}

    def _extract_title(self, soup: BeautifulSoup) -> str:
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text().strip()
        h1_tag = soup.find('h1')
        if h1_tag:
            return h1_tag.get_text().strip()
        return "No title found"

    def _extract_text(self, soup: BeautifulSoup) -> str:
        for script in soup(["script", "style"]):
            script.decompose()
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
        text = main_content.get_text() if main_content else soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        return ' '.join(chunk for chunk in chunks if chunk)[:5000]

    def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        images = []
        for img in soup.find_all('img'):
            src = img.get('src')
            if src:
                if not src.startswith('http'):
                    src = urljoin(base_url, src)
                image_info = {
                    'url': src,
                    'alt': img.get('alt', ''),
                    'title': img.get('title', ''),
                    'width': img.get('width'),
                    'height': img.get('height')
                }
                images.append(image_info)
        return images

    def _extract_videos(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        videos = []
        for video in soup.find_all('video'):
            src = video.get('src')
            if src:
                if not src.startswith('http'):
                    src = urljoin(base_url, src)
                videos.append({'url': src, 'type': 'video', 'platform': 'direct'})

        youtube_patterns = [
            r'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)',
            r'youtu\.be/([a-zA-Z0-9_-]+)',
            r'youtube\.com/embed/([a-zA-Z0-9_-]+)'
        ]
        page_text = str(soup)
        for pattern in youtube_patterns:
            matches = re.findall(pattern, page_text)
            for match in matches:
                videos.append({
                    'url': f'https://www.youtube.com/watch?v={match}',
                    'video_id': match,
                    'type': 'youtube',
                    'platform': 'youtube'
                })
        return videos

    def _extract_metadata(self, soup: BeautifulSoup) -> Dict[str, str]:
        metadata = {}
        for meta in soup.find_all('meta'):
            name = meta.get('name') or meta.get('property')
            content = meta.get('content')
            if name and content:
                metadata[name] = content
        return metadata

    def _determine_content_type(self, url: str, soup: BeautifulSoup) -> str:
        url_lower = url.lower()
        if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
            return 'youtube_video'
        elif 'vimeo.com' in url_lower:
            return 'vimeo_video'
        elif 'tiktok.com' in url_lower:
            return 'tiktok_video'
        elif any(ext in url_lower for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
            return 'image'
        elif soup.find('article') or 'blog' in url_lower or 'news' in url_lower:
            return 'article'
        return 'webpage'

    def analyze_content_relevance(self, content: Dict[str, Any], video_topic: str) -> Dict[str, Any]:
        if not self.deepseek_api_key:
            return {'error': 'DeepSeek API key not provided'}
        try:
            prompt = f"""
            Analyze the following content for relevance to creating a video about: "{video_topic}"

            Content:
            Title: {content.get('title', 'N/A')}
            Type: {content.get('type', 'N/A')}
            Text: {content.get('text', 'N/A')[:1000]}...

            Please provide:
            1. Relevance score (0-10)
            2. Key points that match the video topic
            3. Suggested use in video (introduction, main content, supporting material, conclusion)
            4. Best images/videos to extract (if any)
            5. Timestamp suggestions for video structure

            Respond in JSON format.
            """
            headers = {
                "Authorization": f"Bearer {self.deepseek_api_key}",
                "Content-Type": "application/json"
            }
            body = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are a video content strategist."},
                    {"role": "user", "content": prompt}
                ]
            }
            response = requests.post("https://api.deepseek.com/v1/chat/completions", headers=headers, json=body)
            response.raise_for_status()
            reply = response.json()
            return json.loads(reply['choices'][0]['message']['content'])
        except Exception as e:
            self.logger.error(f"Error analyzing content: {str(e)}")
            return {'error': str(e)}

    def create_video_script(self, analyzed_content: List[Dict[str, Any]], video_topic: str) -> Dict[str, Any]:
        sorted_content = sorted(analyzed_content, key=lambda x: x.get('analysis', {}).get('relevance_score', 0), reverse=True)
        script = {
            'topic': video_topic,
            'duration_estimate': '5-10 minutes',
            'sections': [],
            'assets': {'images': [], 'videos': [], 'text_content': []},
            'timeline': []
        }
        current_time = 0
        for i, content in enumerate(sorted_content[:5]):
            analysis = content.get('analysis', {})
            section = {
                'title': content.get('title', f'Section {i+1}'),
                'start_time': current_time,
                'duration': 60,
                'content_type': content.get('type'),
                'script_text': self._generate_section_script(content, analysis),
                'assets': {
                    'images': content.get('images', [])[:3],
                    'videos': content.get('videos', [])[:1],
                }
            }
            script['sections'].append(section)
            current_time += 60
        for content in sorted_content:
            script['assets']['images'].extend(content.get('images', []))
            script['assets']['videos'].extend(content.get('videos', []))
            script['assets']['text_content'].append({
                'title': content.get('title'),
                'text': content.get('text', '')[:500]
            })
        return script

    def _generate_section_script(self, content: Dict[str, Any], analysis: Dict[str, Any]) -> str:
        title = content.get('title', 'Untitled')
        key_points = analysis.get('key_points', [])
        script = f"In this section, we'll explore {title}. "
        if key_points:
            script += "Key points include: " + ", ".join(key_points[:3]) + ". "
        script += "Let's dive deeper into this topic."
        return script

    def process_urls(self, urls: List[str], video_topic: str) -> Dict[str, Any]:
        self.logger.info(f"Processing {len(urls)} URLs for video topic: {video_topic}")
        extracted_content = []
        analyzed_content = []
        for url in urls:
            self.logger.info(f"Extracting content from: {url}")
            content = self.extract_content_from_url(url)
            if 'error' not in content:
                extracted_content.append(content)
                analysis = self.analyze_content_relevance(content, video_topic)
                content['analysis'] = analysis
                analyzed_content.append(content)
        video_script = self.create_video_script(analyzed_content, video_topic)
        return {
            'video_topic': video_topic,
            'total_urls_processed': len(urls),
            'successful_extractions': len(extracted_content),
            'video_script': video_script,
            'raw_content': extracted_content,
            'analyzed_content': analyzed_content,
            'timestamp': datetime.now().isoformat()
        }

    def export_results(self, results: Dict[str, Any], output_file: str = None):
        if not output_file:
            output_file = f"video_content_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        self.logger.info(f"Results exported to: {output_file}")
        return output_file

if __name__ == "__main__":
    import sys
    if not sys.stdin.isatty():
        input_data = sys.stdin.read()
    elif len(sys.argv) > 1:
        input_data = sys.argv[1]
    else:
        print(json.dumps({"error": "No input provided. Pass JSON via stdin or as an argument."}))
        sys.exit(1)

    try:
        data = json.loads(input_data)
        urls = data.get("urls", [])
        video_topic = data.get("video_topic", "")
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not urls or not video_topic:
            print(json.dumps({"error": "Both 'urls' and 'video_topic' are required in input JSON."}))
            sys.exit(1)
        agent = VideoContentAgent(deepseek_api_key=api_key)
        results = agent.process_urls(urls, video_topic)
        print(json.dumps(results, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
