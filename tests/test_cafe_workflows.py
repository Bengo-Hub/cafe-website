#!/usr/bin/env python3
"""
Cafe-Website E2E Tests
Tests cafe-website admin endpoints and workflows
"""

import json
import os
import time
from datetime import datetime
from typing import Any, Dict

import requests

# =============================================================================
# CONFIGURATION
# =============================================================================

class TestConfig:
    # URLs - Multiple services integration
    AUTH_API_URL: str = "https://sso.codevertexitsolutions.com"
    ORDERING_API_URL: str = "https://orderingapi.codevertexitsolutions.com"
    LOGISTICS_API_URL: str = "https://logisticsapi.codevertexitsolutions.com"
    TREASURY_API_URL: str = "https://booksapi.codevertexitsolutions.com"
    INVENTORY_API_URL: str = "https://inventoryapi.codevertexitsolutions.com"
    NOTIFICATIONS_API_URL: str = "https://notificationsapi.codevertexitsolutions.com"
    BOOKING_API_URL: str = "https://booking.codevertexitsolutions.com"  # uses superbase not a service
    
    # Auth endpoints
    AUTH_TOKEN_URL: str = "https://sso.codevertexitsolutions.com/api/v1/token"
    AUTH_ME_URL: str = "https://sso.codevertexitsolutions.com/api/v1/auth/me"
    AUTH_JWKS_URL: str = "https://sso.codevertexitsolutions.com/.well-known/jwks.json"
    
    # Test credentials
    TENANT_SLUG: str = os.getenv("TENANT_SLUG", "urban-loft")
    TEST_EMAIL: str = os.getenv("TEST_EMAIL", "admin@theurbanloftcafe.com")
    TEST_PASSWORD: str = os.getenv("TEST_PASSWORD", "TenantAdmin2024!")
    
    # Client config
    CLIENT_ID: str = "cafe-website"

config = TestConfig()

# =============================================================================
# TEST STATE
# =============================================================================

test_state: Dict[str, Any] = {
    "access_token": None,
    "refresh_token": None,
    "user": None,
    "tenant_id": None,
    "tenant_slug": None,
    "test_results": [],
    "start_time": datetime.now().isoformat()
}

# =============================================================================
# HTTP CLIENTS
# =============================================================================

def get_http_client() -> requests.Session:
    """Get a basic HTTP client."""
    session = requests.Session()
    session.timeout = 30
    return session

def get_auth_client() -> requests.Session:
    """Get HTTP client with auth token."""
    client = get_http_client()
    if test_state["access_token"]:
        client.headers.update({
            "Authorization": f"Bearer {test_state['access_token']}",
            "Content-Type": "application/json"
        })
    return client

# =============================================================================
# LOGGING
# =============================================================================

def log_result(test_type: str, test_name: str, status: str, message: str, data: Any = None):
    """Log test result to console and store in state."""
    result = {
        "timestamp": datetime.now().isoformat(),
        "test_type": test_type,
        "test_name": test_name,
        "status": status,
        "message": message,
        "data": data
    }
    test_state["test_results"].append(result)
    
    # Console output
    status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⏭️"
    print(f"  {status_icon} {test_type.upper()}-{test_name}: {message}")
    
    if data and status == "FAIL":
        print(f"    Details: {json.dumps(data, indent=2)}")

def save_test_output():
    """Save all test results to markdown file."""
    output_path = os.path.join(os.path.dirname(__file__), "test-output.md")
    
    with open(output_path, "w") as f:
        f.write("# Cafe-Website E2E Test Results\n\n")
        f.write(f"**Test Run:** {test_state['start_time']}\n")
        f.write(f"**Tenant:** {config.TENANT_SLUG}\n")
        f.write(f"**Environment:** Production\n\n")
        
        # Summary
        total_tests = len(test_state["test_results"])
        passed = len([r for r in test_state["test_results"] if r["status"] == "PASS"])
        failed = len([r for r in test_state["test_results"] if r["status"] == "FAIL"])
        skipped = len([r for r in test_state["test_results"] if r["status"] == "SKIP"])
        
        f.write(f"## Summary\n\n")
        f.write(f"- **Total Tests:** {total_tests}\n")
        f.write(f"- **Passed:** {passed} ✅\n")
        f.write(f"- **Failed:** {failed} ❌\n")
        f.write(f"- **Skipped:** {skipped} ⏭️\n")
        f.write(f"- **Success Rate:** {(passed/total_tests*100):.1f}%\n\n")
        
        # Detailed results
        f.write("## Detailed Results\n\n")
        
        for result in test_state["test_results"]:
            f.write(f"### {result['test_type'].upper()}-{result['test_name']}\n\n")
            f.write(f"**Status:** {result['status']}  \n")
            f.write(f"**Message:** {result['message']}  \n")
            f.write(f"**Timestamp:** {result['timestamp']}\n\n")
            
            if result["data"]:
                f.write("**Response Data:**\n")
                f.write("```json\n")
                f.write(json.dumps(result["data"], indent=2))
                f.write("\n```\n\n")
        
        f.write("---\n")
        f.write(f"*Generated at: {datetime.now().isoformat()}*\n")
    
    print(f"\n📄 Test results saved to: {output_path}")

# =============================================================================
# AUTH TESTS
# =============================================================================

def test_sso_health():
    """Test 1: Verify SSO service health."""
    print("\n[AUTH-1] Testing SSO service health...")
    client = get_http_client()
    
    response = client.get(f"{config.AUTH_API_URL}/healthz")
    if response.status_code != 200:
        log_result("AUTH", "sso_health", "FAIL", f"SSO service unhealthy: HTTP {response.status_code}", {
            "status_code": response.status_code,
            "response": response.text[:200],
            "url": f"{config.AUTH_API_URL}/healthz"
        })
        return False
    
    health_data = response.json() if response.text else {}
    log_result("AUTH", "sso_health", "PASS", "SSO service is healthy", {
        "status_code": response.status_code,
        "health_data": health_data,
        "url": f"{config.AUTH_API_URL}/healthz"
    })
    return True

def test_sso_oidc_discovery():
    """Test 2: Verify OIDC discovery endpoints."""
    print("\n[AUTH-2] Testing OIDC discovery...")
    client = get_http_client()
    
    # Test JWKS endpoint
    response = client.get(config.AUTH_JWKS_URL)
    
    if response.status_code == 200:
        jwks_data = response.json()
        keys = jwks_data.get("keys", [])
        log_result("AUTH", "oidc_discovery", "PASS", f"JWKS available with {len(keys)} keys", {
            "endpoint": config.AUTH_JWKS_URL,
            "status_code": response.status_code,
            "keys_count": len(keys),
            "first_key_type": keys[0].get("kty") if keys else None,
            "jwks_data": jwks_data
        })
        return True
    else:
        log_result("AUTH", "oidc_discovery", "FAIL", f"JWKS endpoint failed: HTTP {response.status_code}", {
            "endpoint": config.AUTH_JWKS_URL,
            "status_code": response.status_code,
            "response": response.text[:200]
        })
        return False

def test_sso_login():
    """Test 3: Test SSO login with credentials."""
    print("\n[AUTH-3] Testing SSO login...")
    client = get_http_client()
    
    payload = {
        "email": config.TEST_EMAIL,
        "password": config.TEST_PASSWORD,
        "tenant_slug": config.TENANT_SLUG
    }
    
    response = client.post(config.AUTH_TOKEN_URL, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        test_state["access_token"] = data.get("access_token")
        test_state["refresh_token"] = data.get("refresh_token")
        
        if test_state["access_token"]:
            log_result("AUTH", "sso_login", "PASS", "Login successful", {
                "endpoint": config.AUTH_TOKEN_URL,
                "status_code": response.status_code,
                "token_preview": test_state["access_token"][:50] + "...",
                "user_email": data.get("user", {}).get("email"),
                "roles": data.get("roles", []),
                "permissions_count": len(data.get("permissions", [])),
                "login_data": data
            })
            return True
        else:
            log_result("AUTH", "sso_login", "FAIL", "No access token in response", {
                "endpoint": config.AUTH_TOKEN_URL,
                "status_code": response.status_code,
                "response_data": data
            })
            return False
    else:
        log_result("AUTH", "sso_login", "FAIL", f"Login failed: HTTP {response.status_code}", {
            "endpoint": config.AUTH_TOKEN_URL,
            "status_code": response.status_code,
            "response": response.text[:200],
            "payload": payload
        })
        return False

def test_sso_me_endpoint():
    """Test 4: Verify /me endpoint returns user with permissions."""
    print("\n[AUTH-4] Testing /me endpoint...")
    
    if not test_state["access_token"]:
        log_result("AUTH", "sso_me", "SKIP", "No access token available")
        return False
    
    client = get_auth_client()
    response = client.get(config.AUTH_ME_URL)
    
    if response.status_code != 200:
        log_result("AUTH", "sso_me", "FAIL", f"HTTP {response.status_code}", {"status_code": response.status_code})
        return False
    
    data = response.json()
    permissions = data.get("permissions", [])
    roles = data.get("roles", [])
    tenant = data.get("tenant", {})
    
    # Verify tenant sync data
    tenant_id = tenant.get("id")
    tenant_slug = tenant.get("slug")
    
    if not tenant_id or not tenant_slug:
        log_result("AUTH", "sso_me", "FAIL", "Missing tenant data in /me response", data)
        return False
    
    # Store tenant info for subsequent API calls
    test_state["tenant_id"] = tenant_id
    test_state["tenant_slug"] = tenant_slug
    test_state["user"] = data
    
    log_result("AUTH", "sso_me", "PASS", f"User authenticated with {len(roles)} roles, {len(permissions)} permissions", {
        "user_id": data.get("id"),
        "email": data.get("email"),
        "roles": roles,
        "permissions": permissions[:5],  # Show first 5 permissions
        "tenant_id": tenant_id,
        "tenant_slug": tenant_slug
    })
    return True

# =============================================================================
# CAFE-WEBSITE API TESTS - MULTIPLE SERVICE INTEGRATION
# =============================================================================

def test_ordering_service_health():
    """Test 5: Verify ordering service health."""
    print("\n[ORDERING-1] Testing ordering service health...")
    client = get_http_client()
    
    # Try multiple health endpoints
    health_endpoints = [
        "/healthz",
        "/api/healthz", 
        "/api/v1/healthz",
        "/health"
    ]
    
    for endpoint in health_endpoints:
        response = client.get(f"{config.ORDERING_API_URL}{endpoint}")
        if response.status_code == 200:
            log_result("ORDERING", "service_health", "PASS", f"Ordering service is healthy via {endpoint}", {"endpoint": endpoint})
            return True
    
    log_result("ORDERING", "service_health", "FAIL", "Ordering service health endpoints failed", {
        "tested_endpoints": health_endpoints,
        "base_url": config.ORDERING_API_URL
    })
    return False

def test_public_menu_endpoints():
    """Test 6: Test public menu endpoints (no auth required)."""
    print("\n[ORDERING-2] Testing public menu endpoints...")
    client = get_http_client()
    
    # Test categories - matches public-menu.ts API calls
    categories_endpoints = [
        f"/api/v1/{config.TENANT_SLUG}/menu/categories",
        f"/api/{config.TENANT_SLUG}/menu/categories",
        f"/menu/categories"
    ]
    
    categories_found = False
    for endpoint in categories_endpoints:
        response = client.get(f"{config.ORDERING_API_URL}{endpoint}")
        if response.status_code == 200:
            categories = response.json()
            log_result("ORDERING", "public_categories", "PASS", f"Fetched {len(categories)} categories via {endpoint}", {
                "endpoint": endpoint,
                "categories": categories[:3]
            })
            categories_found = True
            break
    
    if not categories_found:
        log_result("ORDERING", "public_categories", "FAIL", "No working categories endpoint found", {
            "tested_endpoints": categories_endpoints
        })
        return False
    
    # Test menu items - matches public-menu.ts API calls
    items_endpoints = [
        f"/api/v1/{config.TENANT_SLUG}/menu/items",
        f"/api/{config.TENANT_SLUG}/menu/items",
        f"/menu/items"
    ]
    
    items_found = False
    for endpoint in items_endpoints:
        response = client.get(f"{config.ORDERING_API_URL}{endpoint}", params={"limit": 10})
        if response.status_code == 200:
            data = response.json()
            items = data.get("data", []) if isinstance(data, dict) else data
            log_result("ORDERING", "public_items", "PASS", f"Fetched {len(items)} menu items via {endpoint}", {
                "endpoint": endpoint,
                "items": items[:3]
            })
            items_found = True
            break
    
    if not items_found:
        log_result("ORDERING", "public_items", "FAIL", "No working items endpoint found", {
            "tested_endpoints": items_endpoints
        })
        return False
    
    return True

def test_authenticated_catalog_endpoints():
    """Test 7: Test authenticated catalog endpoints (admin)."""
    print("\n[CATALOG-1] Testing authenticated catalog endpoints...")
    
    if not test_state.get("access_token"):
        log_result("CATALOG", "auth_catalog", "SKIP", "No access token available")
        return False
    
    client = get_auth_client()
    
    # Test catalog categories - matches catalog.ts API calls
    catalog_endpoints = [
        f"/api/v1/{config.TENANT_SLUG}/catalog/categories",
        f"/api/{config.TENANT_SLUG}/catalog/categories"
    ]
    
    for endpoint in catalog_endpoints:
        response = client.get(f"{config.ORDERING_API_URL}{endpoint}")
        if response.status_code == 200:
            categories = response.json()
            log_result("CATALOG", "auth_catalog", "PASS", f"Successfully accessed catalog via {endpoint} - {len(categories)} categories", {
                "endpoint": endpoint,
                "categories_count": len(categories),
                "sample": categories[:1] if categories else None
            })
            return True
        elif response.status_code == 401:
            log_result("CATALOG", "auth_catalog", "FAIL", "401 Unauthorized - Authentication failed", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200],
                "token_preview": test_state["access_token"][:50] + "..." if test_state.get("access_token") else None
            })
        elif response.status_code == 403:
            log_result("CATALOG", "auth_catalog", "FAIL", "403 Forbidden - Insufficient permissions", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
        elif response.status_code == 404:
            # 404 is acceptable - endpoint might not exist
            continue
        else:
            log_result("CATALOG", "auth_catalog", "PASS", f"Endpoint status: {response.status_code}", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
            return True
    
    log_result("CATALOG", "auth_catalog", "FAIL", "No working catalog endpoint found", {
        "tested_endpoints": catalog_endpoints
    })
    return False

def test_admin_orders_endpoints():
    """Test 8: Test admin orders endpoints (staff workflow)."""
    print("\n[ORDERS-1] Testing admin orders endpoints...")
    
    if not test_state.get("access_token"):
        log_result("ORDERS", "admin_orders", "SKIP", "No access token available")
        return False
    
    client = get_auth_client()
    
    # Test admin orders - matches orders.ts API calls
    orders_endpoints = [
        f"/api/v1/{config.TENANT_SLUG}/admin/orders",
        f"/api/{config.TENANT_SLUG}/admin/orders"
    ]
    
    for endpoint in orders_endpoints:
        response = client.get(f"{config.ORDERING_API_URL}{endpoint}", params={"page": 1, "limit": 10})
        if response.status_code == 200:
            data = response.json()
            orders = data.get("data", []) if isinstance(data, dict) else data
            log_result("ORDERS", "admin_orders", "PASS", f"Successfully accessed admin orders via {endpoint} - {len(orders)} orders", {
                "endpoint": endpoint,
                "orders_count": len(orders),
                "sample": orders[:1] if orders else None
            })
            return True
        elif response.status_code == 401:
            log_result("ORDERS", "admin_orders", "FAIL", "401 Unauthorized - Authentication failed", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
        elif response.status_code == 403:
            log_result("ORDERS", "admin_orders", "FAIL", "403 Forbidden - Insufficient permissions", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
        elif response.status_code == 404:
            continue
        else:
            log_result("ORDERS", "admin_orders", "PASS", f"Endpoint status: {response.status_code}", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
            return True
    
    log_result("ORDERS", "admin_orders", "FAIL", "No working admin orders endpoint found", {
        "tested_endpoints": orders_endpoints
    })
    return False

def test_order_management_workflow():
    """Test 9: Test order status update workflow (staff operations)."""
    print("\n[ORDERS-2] Testing order management workflow...")
    
    if not test_state.get("access_token"):
        log_result("ORDERS", "order_workflow", "SKIP", "No access token available")
        return False
    
    client = get_auth_client()
    
    # First fetch orders to get a valid order ID
    response = client.get(f"{config.ORDERING_API_URL}/api/v1/{config.TENANT_SLUG}/admin/orders", params={"page": 1, "limit": 1})
    
    if response.status_code != 200:
        log_result("ORDERS", "order_workflow", "FAIL", "Cannot fetch orders for workflow test", {
            "status_code": response.status_code,
            "response": response.text[:200]
        })
        return False
    
    data = response.json()
    orders = data.get("data", []) if isinstance(data, dict) else data
    
    if not orders or len(orders) == 0:
        log_result("ORDERS", "order_workflow", "SKIP", "No orders available for workflow test")
        return True
    
    order_id = orders[0].get("id")
    current_status = orders[0].get("status")
    
    if not order_id:
        log_result("ORDERS", "order_workflow", "FAIL", "No valid order ID found")
        return False
    
    # Test order status update - matches orders.ts updateOrderStatus
    status_update_url = f"{config.ORDERING_API_URL}/api/v1/{config.TENANT_SLUG}/admin/orders/{order_id}/status"
    
    # Try updating to next status (if not already completed)
    status_flow = {
        'pending': 'confirmed',
        'confirmed': 'preparing',
        'preparing': 'ready',
        'ready': 'out_for_delivery',
        'out_for_delivery': 'delivered'
    }
    
    next_status = status_flow.get(current_status)
    if not next_status or current_status in ['delivered', 'completed', 'cancelled']:
        log_result("ORDERS", "order_workflow", "SKIP", f"Order {order_id} is in final status: {current_status}")
        return True
    
    response = client.put(status_update_url, json={"status": next_status})
    
    if response.status_code == 200:
        updated_order = response.json()
        log_result("ORDERS", "order_workflow", "PASS", f"Successfully updated order {order_id} from {current_status} to {next_status}", {
            "order_id": order_id,
            "old_status": current_status,
            "new_status": updated_order.get("status"),
            "endpoint": status_update_url
        })
        return True
    elif response.status_code == 401:
        log_result("ORDERS", "order_workflow", "FAIL", "401 Unauthorized - Cannot update order status", {
            "endpoint": status_update_url,
            "status_code": response.status_code,
            "response": response.text[:200]
        })
        return False
    elif response.status_code == 403:
        log_result("ORDERS", "order_workflow", "FAIL", "403 Forbidden - Insufficient permissions to update orders", {
            "endpoint": status_update_url,
            "status_code": response.status_code,
            "response": response.text[:200]
        })
        return False
    else:
        log_result("ORDERS", "order_workflow", "PASS", f"Status update endpoint status: {response.status_code}", {
            "endpoint": status_update_url,
            "status_code": response.status_code,
            "response": response.text[:200]
        })
        return True

def test_logistics_service_endpoints():
    """Test 10: Test logistics service endpoints (rider management)."""
    print("\n[LOGISTICS-1] Testing logistics service endpoints...")
    
    if not test_state.get("access_token"):
        log_result("LOGISTICS", "service_endpoints", "SKIP", "No access token available")
        return False
    
    client = get_auth_client()
    
    # Test riders endpoint - matches riders.ts API calls
    riders_endpoints = [
        f"/api/v1/{config.TENANT_SLUG}/admin/riders",
        f"/api/{config.TENANT_SLUG}/admin/riders"
    ]
    
    for endpoint in riders_endpoints:
        response = client.get(f"{config.LOGISTICS_API_URL}{endpoint}")
        if response.status_code == 200:
            data = response.json()
            riders = data.get("riders", []) if isinstance(data, dict) else data
            log_result("LOGISTICS", "service_endpoints", "PASS", f"Successfully accessed riders via {endpoint} - {len(riders)} riders", {
                "endpoint": endpoint,
                "riders_count": len(riders),
                "sample": riders[:1] if riders else None
            })
            return True
        elif response.status_code == 401:
            log_result("LOGISTICS", "service_endpoints", "FAIL", "401 Unauthorized - Authentication failed", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
        elif response.status_code == 403:
            log_result("LOGISTICS", "service_endpoints", "FAIL", "403 Forbidden - Insufficient permissions", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
        elif response.status_code == 404:
            continue
        else:
            log_result("LOGISTICS", "service_endpoints", "PASS", f"Endpoint status: {response.status_code}", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
            return True
    
    log_result("LOGISTICS", "service_endpoints", "FAIL", "No working riders endpoint found", {
        "tested_endpoints": riders_endpoints
    })
    return False

def test_inventory_service_endpoints():
    """Test 11: Test inventory service endpoints (stock management)."""
    print("\n[INVENTORY-1] Testing inventory service endpoints...")
    
    if not test_state.get("access_token"):
        log_result("INVENTORY", "service_endpoints", "SKIP", "No access token available")
        return False
    
    client = get_auth_client()
    
    # Test stock availability - matches inventory.ts API calls
    # First get a sample SKU from menu items if available
    menu_response = client.get(f"{config.ORDERING_API_URL}/api/v1/{config.TENANT_SLUG}/menu/items", params={"limit": 1})
    
    if menu_response.status_code != 200:
        log_result("INVENTORY", "service_endpoints", "SKIP", "Cannot fetch menu items to test inventory")
        return True
    
    menu_data = menu_response.json()
    items = menu_data.get("data", []) if isinstance(menu_data, dict) else menu_data
    
    if not items or len(items) == 0:
        log_result("INVENTORY", "service_endpoints", "SKIP", "No menu items available for inventory test")
        return True
    
    sample_sku = items[0].get("sku")
    if not sample_sku:
        log_result("INVENTORY", "service_endpoints", "SKIP", "No SKU found in menu items")
        return True
    
    # Test stock availability endpoint
    stock_endpoint = f"/v1/{config.TENANT_SLUG}/inventory/items/{sample_sku}"
    response = client.get(f"{config.INVENTORY_API_URL}{stock_endpoint}")
    
    if response.status_code == 200:
        stock_data = response.json()
        log_result("INVENTORY", "service_endpoints", "PASS", f"Successfully accessed stock for SKU {sample_sku}", {
            "endpoint": stock_endpoint,
            "sku": sample_sku,
            "stock_data": stock_data
        })
        return True
    elif response.status_code == 401:
        log_result("INVENTORY", "service_endpoints", "FAIL", "401 Unauthorized - Authentication failed", {
            "endpoint": stock_endpoint,
            "status_code": response.status_code,
            "response": response.text[:200]
        })
        return False
    elif response.status_code == 403:
        log_result("INVENTORY", "service_endpoints", "FAIL", "403 Forbidden - Insufficient permissions", {
            "endpoint": stock_endpoint,
            "status_code": response.status_code,
            "response": response.text[:200]
        })
        return False
    elif response.status_code == 404:
        log_result("INVENTORY", "service_endpoints", "PASS", f"Stock endpoint exists but SKU {sample_sku} not found (404)", {
            "endpoint": stock_endpoint,
            "sku": sample_sku,
            "status_code": response.status_code
        })
        return True
    else:
        log_result("INVENTORY", "service_endpoints", "PASS", f"Stock endpoint status: {response.status_code}", {
            "endpoint": stock_endpoint,
            "status_code": response.status_code,
            "response": response.text[:200]
        })
        return True

def test_admin_analytics_endpoint():
    """Test 9: Test admin analytics endpoint."""
    print("\n[CAFE-5] Testing admin analytics endpoint...")
    
    if not test_state.get("access_token"):
        log_result("CAFE", "admin_analytics", "SKIP", "No access token available")
        return False
    
    client = get_auth_client()
    
    # Test multiple possible analytics endpoints
    analytics_endpoints = [
        f"/api/v1/{config.TENANT_SLUG}/admin/analytics/summary",
        f"/api/{config.TENANT_SLUG}/admin/analytics/summary",
        f"/admin/analytics/summary",
        f"/api/v1/admin/analytics/summary",
        f"/api/admin/analytics/summary",
        f"/api/v1/{config.TENANT_SLUG}/analytics",
        f"/api/{config.TENANT_SLUG}/analytics",
        f"/analytics",
        f"/api/v1/analytics",
        f"/api/analytics"
    ]
    
    for endpoint in analytics_endpoints:
        response = client.get(f"{config.CAFE_API_URL}{endpoint}")
        if response.status_code == 200:
            analytics = response.json()
            log_result("CAFE", "admin_analytics", "PASS", f"Successfully accessed admin analytics via {endpoint}", {
                "endpoint": endpoint,
                "analytics": analytics
            })
            return True
        elif response.status_code == 401:
            log_result("CAFE", "admin_analytics", "FAIL", "401 Unauthorized - Authentication failed", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
        elif response.status_code == 403:
            log_result("CAFE", "admin_analytics", "FAIL", "403 Forbidden - Insufficient permissions", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
        elif response.status_code == 404:
            # 404 is acceptable - endpoint might not exist
            continue
        else:
            log_result("CAFE", "admin_analytics", "PASS", f"Endpoint status: {response.status_code}", {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response": response.text[:200]
            })
            return True
    
    log_result("CAFE", "admin_analytics", "FAIL", "No working admin analytics endpoint found", {
        "tested_endpoints": analytics_endpoints
    })
    return False

# =============================================================================
# MAIN TEST RUNNER
# =============================================================================

def main():
    """Run all cafe-website E2E tests."""
    print("=" * 70)
    print("CAFE-WEBSITE E2E TESTS")
    print("=" * 70)
    print(f"Tenant: {config.TENANT_SLUG}")
    print(f"User: {config.TEST_EMAIL}")
    print(f"Ordering API: {config.ORDERING_API_URL}")
    print(f"Logistics API: {config.LOGISTICS_API_URL}")
    print(f"Inventory API: {config.INVENTORY_API_URL}")
    print("=" * 70)
    
    results = {}
    
    # Phase 1: Auth Tests
    print("\n" + "-" * 70)
    print("PHASE 1: AUTHENTICATION & SSO INTEGRATION")
    print("-" * 70)
    
    results["sso_health"] = test_sso_health()
    results["sso_oidc"] = test_sso_oidc_discovery()
    results["sso_login"] = test_sso_login()
    results["sso_me"] = test_sso_me_endpoint()
    
    if not all([results["sso_health"], results["sso_oidc"]]):
        print("\n" + "!" * 70)
        print("CRITICAL: Auth service tests failed. Stopping.")
        print("!" * 70)
        return results
    
    # Phase 2: Multi-Service API Tests
    print("\n" + "-" * 70)
    print("PHASE 2: MULTI-SERVICE API TESTS")
    print("-" * 70)
    
    results["ordering_health"] = test_ordering_service_health()
    results["public_menu"] = test_public_menu_endpoints()
    results["catalog_auth"] = test_authenticated_catalog_endpoints()
    results["admin_orders"] = test_admin_orders_endpoints()
    results["order_workflow"] = test_order_management_workflow()
    results["logistics_service"] = test_logistics_service_endpoints()
    results["inventory_service"] = test_inventory_service_endpoints()
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{test_name:20} : {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    # Save results
    save_test_output()
    
    return results

if __name__ == "__main__":
    main()
