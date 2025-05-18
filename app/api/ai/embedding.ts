import { createClient } from '@supabase/supabase-js';

// Simple text embedding function using open source models
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Using a small local model for embeddings
    // This could be replaced with a more sophisticated model like MPNet or SBERT
    const response = await fetch('http://localhost:3000/api/ai/local-embedding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error(`Error generating embedding: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return a zero embedding as fallback
    return new Array(384).fill(0);
  }
}

// Vector similarity calculation
function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must be of the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Store embeddings in database
async function storeEmbedding(
  objectId: string,
  objectType: 'post' | 'activity' | 'user' | 'message', 
  embedding: number[],
  metadata: Record<string, any>
) {
  // Initialize Supabase client (replace with your own credentials)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { error } = await supabase
    .from('embeddings')
    .insert({
      object_id: objectId,
      object_type: objectType,
      embedding,
      metadata,
      created_at: new Date().toISOString(),
    });
    
  if (error) {
    console.error('Error storing embedding:', error);
    throw error;
  }
}

// Find similar items based on embedding
async function findSimilarItems(
  embedding: number[],
  objectType: 'post' | 'activity' | 'user' | 'message',
  limit: number = 10
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // For PostgreSQL with pgvector, you could use:
  // const { data, error } = await supabase.rpc('match_embeddings', {
  //   query_embedding: embedding,
  //   object_type: objectType,
  //   match_threshold: 0.7,
  //   match_count: limit
  // });

  // Simplified approach for implementation without pgvector:
  const { data, error } = await supabase
    .from('embeddings')
    .select('*')
    .eq('object_type', objectType)
    .limit(100); // Over-fetch to filter client-side
    
  if (error) {
    console.error('Error finding similar items:', error);
    throw error;
  }
  
  // Calculate similarities client-side
  const withSimilarity = data.map(item => ({
    ...item,
    similarity: calculateCosineSimilarity(embedding, item.embedding)
  }));
  
  // Sort by similarity and return top N
  return withSimilarity
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export { 
  generateEmbedding, 
  storeEmbedding, 
  findSimilarItems,
  calculateCosineSimilarity
}; 