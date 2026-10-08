import os
import math
from typing import List, Dict, Any, Tuple

# Indexed mock vector knowledge base for summits
EVENT_KNOWLEDGE_BASE = [
    {
        "chunkId": "chunk-101",
        "eventId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "organizationId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "title": "Opening Keynote: The Dawn of Multi-Agent Systems",
        "text": "Dr. Aris Thorne (Chief AI Scientist at Synthetix Lab) presents the Opening Keynote on November 15 at 09:30 AM in Grand Stage A (Hall 100). The keynote covers autonomous agent reasoning loops, multi-agent coordination, and real-time planning frameworks in enterprise environments.",
        "keywords": ["aris", "thorne", "keynote", "opening", "speaker", "multi-agent", "agent", "swarm", "9:30", "grand stage"]
    },
    {
        "chunkId": "chunk-102",
        "eventId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "organizationId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "title": "Architecting Production RAG Workshop",
        "text": "Kenji Takahashi (CEO of VectorGraph) conducts the technical workshop on Architecting Production RAG with Vector Caching & Hybrid Search at 11:15 AM - 12:45 PM in Workshop Room 2B. Focus is on chunking strategies, pgvector tuning, and sub-50ms latency.",
        "keywords": ["kenji", "takahashi", "rag", "workshop", "vector", "caching", "pgvector", "11:15", "room 2b"]
    },
    {
        "chunkId": "chunk-103",
        "eventId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "organizationId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "title": "Panel: Event-Driven Microservices with Kafka",
        "text": "Aria Patel (VP at HyperScale Cloud) moderates the panel at 02:00 PM - 03:15 PM in Auditorium C on High-Throughput Event-Driven Microservices with Kafka, discussing consumer groups, CQRS, and dead-letter queues.",
        "keywords": ["aria", "patel", "kafka", "microservices", "panel", "auditorium c", "2:00", "3:15", "3 pm", "afternoon"]
    },
    {
        "chunkId": "chunk-104",
        "eventId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "organizationId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "title": "Venue Logistics & Parking",
        "text": "The Global AI Summit 2026 takes place at the Moscone Convention Center, 747 Howard St, San Francisco, CA 94103. Validated parking is available at the Fifth & Mission Garage. Online attendees can join via https://stream.eventsphere.io/ai-summit-2026.",
        "keywords": ["venue", "location", "where", "address", "parking", "moscone", "san francisco", "stream", "online"]
    },
    {
        "chunkId": "chunk-105",
        "eventId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "organizationId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "title": "Sponsors and Expo Booths",
        "text": "Platinum Sponsor: HyperCloud Inc. at Booth #101 (Hall A) featuring Cloud & Vector Acceleration. Gold Sponsor: DataStream Labs at Booth #204 (Hall B) demonstrating Kafka Real-Time Stream Analytics.",
        "keywords": ["sponsor", "sponsors", "booth", "hypercloud", "datastream", "hall a", "hall b", "expo"]
    },
    {
        "chunkId": "chunk-106",
        "eventId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "organizationId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "title": "Ticketing, Registration & Promo Codes",
        "text": "Tickets: Virtual Pass ($99), Standard In-Person ($499), VIP All-Access ($999). Promo code SPHERE20 provides a 20% discount on all passes.",
        "keywords": ["ticket", "tickets", "price", "pricing", "register", "registration", "promo", "discount", "sphere20", "vip"]
    }
]

class RAGService:
    def __init__(self):
        self.documents = EVENT_KNOWLEDGE_BASE

    def retrieve_context(self, query: str, event_id: str = None, top_k: int = 2) -> List[Dict[str, Any]]:
        query_terms = set(query.lower().split())
        scored_chunks: List[Tuple[float, Dict[str, Any]]] = []

        for chunk in self.documents:
            # Multi-tenant event boundary filter
            if event_id and chunk["eventId"] != event_id:
                continue

            # Calculate keyword and semantic relevance score
            match_count = sum(1 for kw in chunk["keywords"] if any(term in kw or kw in term for term in query_terms))
            score = match_count / (len(chunk["keywords"]) + 1)
            
            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort by relevance
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        if not scored_chunks:
            # Return default summary chunk if no exact term match
            return [self.documents[0]]
        
        return [chunk for _, chunk in scored_chunks[:top_k]]

    def generate_response(self, query: str, event_id: str = None) -> Tuple[str, List[str]]:
        contexts = self.retrieve_context(query, event_id)
        sources = [f"{c['title']} (RAG Vector #{c['chunkId']})" for c in contexts]
        
        combined_text = " ".join([c["text"] for c in contexts])
        
        q = query.lower()
        if "speaker" in q or "speaking" in q or "aris" in q:
            answer = f"According to the verified summit schedule: {contexts[0]['text']}"
        elif "3 pm" in q or "agenda" in q or "schedule" in q or "session" in q:
            answer = f"Here is the relevant schedule info: {contexts[0]['text']}"
        elif "venue" in q or "where" in q or "location" in q:
            answer = f"The venue details: {contexts[0]['text']}"
        elif "sponsor" in q or "booth" in q:
            answer = f"Sponsor directory information: {contexts[0]['text']}"
        elif "ticket" in q or "price" in q or "register" in q:
            answer = f"Ticketing options: {contexts[0]['text']}"
        else:
            answer = f"Based on Event Sphere's vector RAG knowledge index for this summit: {combined_text}"

        return answer, sources

rag_service = RAGService()
