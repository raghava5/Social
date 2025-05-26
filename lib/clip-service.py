#!/usr/bin/env python3
"""
CLIP-based Image Analysis Service for Spoke Detection
Uses OpenAI's CLIP model to classify images into the 9 life spokes.
"""

import torch
import clip
from PIL import Image
import numpy as np
import argparse
import json
import sys
import os
from pathlib import Path

class SpokeImageAnalyzer:
    def __init__(self):
        """Initialize CLIP model and spoke definitions"""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🚀 Loading CLIP model on {self.device}...")
        
        # Load CLIP model
        self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)
        
        # Define the 9 spokes with descriptive text for better CLIP matching
        self.spokes = {
            "Spiritual": [
                "meditation and mindfulness",
                "prayer and spiritual practice", 
                "zen and enlightenment",
                "sacred and divine imagery",
                "religious symbols and places"
            ],
            "Mental": [
                "mental health and therapy",
                "psychology and counseling",
                "stress and anxiety relief",
                "emotional well-being",
                "mental wellness activities"
            ],
            "Physical": [
                "fitness and exercise",
                "sports and athletics",
                "gym and workout",
                "running and jogging",
                "yoga and physical activity"
            ],
            "Personal": [
                "personal development and growth",
                "self-improvement and goals",
                "journaling and reflection",
                "habits and productivity",
                "individual achievement"
            ],
            "Professional": [
                "work and career",
                "business and office",
                "professional development",
                "meetings and teamwork",
                "leadership and management"
            ],
            "Financial": [
                "money and finances",
                "investment and savings",
                "budget and expenses",
                "wealth and economy",
                "financial planning"
            ],
            "Social": [
                "friends and family",
                "relationships and love",
                "social gatherings",
                "community and networking",
                "interpersonal connections"
            ],
            "Societal": [
                "politics and society",
                "social issues and activism",
                "community service",
                "volunteering and charity",
                "justice and equality"
            ],
            "Fun & Recreation": [
                "entertainment and fun",
                "games and leisure",
                "travel and adventure",
                "hobbies and recreation",
                "movies and music"
            ]
        }
        
        # Prepare text embeddings for all spokes
        self.prepare_text_embeddings()
        print("✅ CLIP model loaded successfully!")
    
    def prepare_text_embeddings(self):
        """Pre-compute text embeddings for all spoke descriptions"""
        self.spoke_embeddings = {}
        
        for spoke, descriptions in self.spokes.items():
            # Create text prompts for better matching
            prompts = [f"a photo of {desc}" for desc in descriptions]
            
            # Tokenize and encode
            text_tokens = clip.tokenize(prompts).to(self.device)
            
            with torch.no_grad():
                text_features = self.model.encode_text(text_tokens)
                # Average the embeddings for this spoke
                avg_embedding = text_features.mean(dim=0)
                self.spoke_embeddings[spoke] = avg_embedding
    
    def analyze_image(self, image_path: str, confidence_threshold: float = 0.15):
        """
        Analyze an image and return the most likely spoke
        
        Args:
            image_path: Path to the image file
            confidence_threshold: Minimum confidence to return a spoke
            
        Returns:
            dict: {spoke: str, confidence: float, all_scores: dict}
        """
        try:
            # Load and preprocess image
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
            
            # Get image embedding
            with torch.no_grad():
                image_features = self.model.encode_image(image_tensor)
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            # Calculate similarities with all spokes
            similarities = {}
            for spoke, text_embedding in self.spoke_embeddings.items():
                text_embedding = text_embedding / text_embedding.norm()
                similarity = (image_features @ text_embedding.T).item()
                similarities[spoke] = float(similarity)
            
            # Find best match
            best_spoke = max(similarities.keys(), key=lambda k: similarities[k])
            best_confidence = similarities[best_spoke]
            
            # Apply confidence threshold
            final_spoke = best_spoke if best_confidence >= confidence_threshold else None
            
            result = {
                "spoke": final_spoke,
                "confidence": best_confidence,
                "all_scores": similarities,
                "threshold_met": best_confidence >= confidence_threshold
            }
            
            if final_spoke:
                print(f"🎯 Detected spoke: {final_spoke} (confidence: {best_confidence:.3f})")
            else:
                print(f"❓ No confident spoke detected (best: {best_spoke} at {best_confidence:.3f})")
            
            return result
            
        except Exception as e:
            print(f"❌ Error analyzing image: {str(e)}")
            return {
                "spoke": None,
                "confidence": 0.0,
                "error": str(e),
                "all_scores": {}
            }
    
    def batch_analyze(self, image_paths: list, confidence_threshold: float = 0.15):
        """Analyze multiple images in batch"""
        results = []
        for path in image_paths:
            result = self.analyze_image(path, confidence_threshold)
            result["image_path"] = path
            results.append(result)
        return results

def main():
    """Command line interface for the CLIP service"""
    parser = argparse.ArgumentParser(description="Analyze images for spoke classification using CLIP")
    parser.add_argument("image_path", help="Path to the image file")
    parser.add_argument("--confidence", type=float, default=0.15, 
                       help="Confidence threshold (default: 0.15)")
    parser.add_argument("--json", action="store_true", 
                       help="Output results as JSON")
    
    args = parser.parse_args()
    
    # Initialize analyzer
    analyzer = SpokeImageAnalyzer()
    
    # Analyze image
    result = analyzer.analyze_image(args.image_path, args.confidence)
    
    if args.json:
        # Output JSON for API integration
        print(json.dumps(result, indent=2))
    else:
        # Human-readable output
        print(f"\n📊 Analysis Results for: {args.image_path}")
        print(f"🎯 Detected Spoke: {result['spoke'] or 'None'}")
        print(f"📈 Confidence: {result['confidence']:.3f}")
        print(f"✅ Threshold Met: {result['threshold_met']}")
        
        print("\n📋 All Scores:")
        for spoke, score in sorted(result['all_scores'].items(), 
                                 key=lambda x: x[1], reverse=True):
            print(f"  {spoke}: {score:.3f}")

if __name__ == "__main__":
    main() 