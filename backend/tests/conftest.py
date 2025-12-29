"""
Pytest configuration and fixtures
"""
import pytest
from unittest.mock import patch
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Mock MongoDB before importing app
with patch('app.core.mongodb.MongoDB.connect'):
    with patch('app.core.mongodb.MongoDB.disconnect'):
        with patch('app.core.mongodb.MongoDB.is_connected', return_value=True):
            with patch('app.core.mongodb.MongoDB.db', None):
                with patch('app.core.mongodb.MongoDB.client', None):
                    from main import app


@pytest.fixture
def sync_client():
    """Create a synchronous test client using httpx directly"""
    import httpx
    from httpx import ASGITransport
    
    # Use ASGITransport with AsyncClient but wrap for sync use
    transport = ASGITransport(app=app)
    # Create a sync wrapper
    class SyncTestClient:
        def __init__(self, transport, base_url):
            self.transport = transport
            self.base_url = base_url
        
        def _make_request(self, method, url, **kwargs):
            import asyncio
            async def _async_request():
                async with httpx.AsyncClient(transport=self.transport, base_url=self.base_url) as client:
                    return await client.request(method, url, **kwargs)
            return asyncio.run(_async_request())
        
        def get(self, url, **kwargs):
            return self._make_request("GET", url, **kwargs)
        
        def post(self, url, **kwargs):
            return self._make_request("POST", url, **kwargs)
        
        def put(self, url, **kwargs):
            return self._make_request("PUT", url, **kwargs)
        
        def delete(self, url, **kwargs):
            return self._make_request("DELETE", url, **kwargs)
        
        def options(self, url, **kwargs):
            return self._make_request("OPTIONS", url, **kwargs)
    
    return SyncTestClient(transport, "http://testserver")
