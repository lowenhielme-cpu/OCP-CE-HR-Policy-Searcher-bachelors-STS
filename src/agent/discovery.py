"""Shared helpers for country/region discovery workflows."""


def build_discovery_prompt(country: str) -> str:
    """Build the natural-language instruction used by CLI and API discovery."""
    return (
        f"Discover new coverage for {country}. "
        f"Search for government websites about data center waste heat, "
        f"energy efficiency, district heating, and heat recovery regulation "
        f"in {country}. Use the country's native language for search terms "
        f"when appropriate. Add any relevant government websites you find. "
        f"Then analyze the most promising pages for policy content. "
        f"Summarize what you discovered."
    )
