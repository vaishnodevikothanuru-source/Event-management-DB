from typing import List, Dict, Any
from app.models.schemas import RecommendationRequest, RecommendationResponse, SessionRecommendation, AttendeeRecommendation

CANDIDATE_ATTENDEES = [
    {
        "userId": "net-user-1",
        "name": "Alex Mercer",
        "jobTitle": "Principal Research Scientist",
        "company": "Cognitech AI",
        "skills": ["LLMs", "RAG", "Agent Swarms", "Python"],
        "interests": ["Autonomous Agents", "Vector DBs"]
    },
    {
        "userId": "net-user-2",
        "name": "Sarah Kim",
        "jobTitle": "VP of Engineering",
        "company": "CloudWave Systems",
        "skills": ["Kubernetes", "Microservices", "Distributed Systems", "Kafka"],
        "interests": ["Microservices", "Cloud", "Distributed Systems"]
    },
    {
        "userId": "net-user-3",
        "name": "David Zhang",
        "jobTitle": "Founding Partner",
        "company": "Apex Seed Ventures",
        "skills": ["Seed Investing", "SaaS Growth", "Fundraising"],
        "interests": ["GenAI", "Enterprise SaaS"]
    }
]

CANDIDATE_SESSIONS = [
    {
        "sessionId": "sess1111-1111-1111-1111-111111111111",
        "title": "Opening Keynote: The Dawn of Multi-Agent Systems",
        "tags": ["Autonomous Agents", "AI", "LLMs", "Multi-Agent"]
    },
    {
        "sessionId": "sess2222-2222-2222-2222-222222222222",
        "title": "Architecting Production RAG with Vector Caching & Hybrid Search",
        "tags": ["RAG", "Vector DB", "pgvector", "Python", "Embeddings"]
    },
    {
        "sessionId": "sess3333-3333-3333-3333-333333333333",
        "title": "Panel: High-Throughput Event-Driven Microservices with Kafka",
        "tags": ["Microservices", "Kafka", "Distributed Systems", "Spring Boot"]
    }
]

class RecommendationService:
    def generate_recommendations(self, req: RecommendationRequest) -> RecommendationResponse:
        user_skills_set = set([s.lower() for s in req.skills])
        user_interests_set = set([i.lower() for i in req.interests])
        all_user_tags = user_skills_set.union(user_interests_set)

        # 1. Match Attendees
        att_recs: List[AttendeeRecommendation] = []
        for cand in CANDIDATE_ATTENDEES:
            cand_skills_set = set([s.lower() for s in cand["skills"]])
            cand_interests_set = set([i.lower() for i in cand["interests"]])
            cand_all = cand_skills_set.union(cand_interests_set)

            intersection = all_user_tags.intersection(cand_all)
            union = all_user_tags.union(cand_all)
            
            # Jaccard / Cosine similarity approximation
            similarity = len(intersection) / len(union) if union else 0.5
            match_score = int(70 + (similarity * 28)) # Scale to 70-98% range

            att_recs.append(AttendeeRecommendation(
                userId=cand["userId"],
                name=cand["name"],
                jobTitle=cand["jobTitle"],
                company=cand["company"],
                matchScore=match_score,
                commonSkills=list(intersection) if intersection else [cand["skills"][0]]
            ))

        att_recs.sort(key=lambda x: x.matchScore, reverse=True)

        # 2. Match Sessions
        sess_recs: List[SessionRecommendation] = []
        for sess in CANDIDATE_SESSIONS:
            sess_tags_set = set([t.lower() for t in sess["tags"]])
            common = all_user_tags.intersection(sess_tags_set)
            score = int(75 + (len(common) * 8))

            sess_recs.append(SessionRecommendation(
                sessionId=sess["sessionId"],
                title=sess["title"],
                matchScore=min(99, score),
                reason=f"Matches your background in {', '.join(list(common)[:2]) if common else 'Modern Software Systems'}"
            ))

        sess_recs.sort(key=lambda x: x.matchScore, reverse=True)

        return RecommendationResponse(
            sessionRecommendations=sess_recs,
            attendeeRecommendations=att_recs
        )

recommendation_service = RecommendationService()
