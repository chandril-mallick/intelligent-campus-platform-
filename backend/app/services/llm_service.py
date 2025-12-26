from typing import Optional
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

class LLMService:
    """
    Service for generating coherent responses using Ollama LLM
    """
    def __init__(self, model_name: str = "gemma3:1b"):
        """
        Initialize the LLM service with Ollama model
        
        Args:
            model_name: Ollama model name (default: gemma3:1b - fast and efficient)
        """
        print(f"Initializing LLM service with Ollama model: {model_name}...")
        
        # Initialize Ollama LLM
        self.llm = Ollama(
            model=model_name,
            temperature=0.7,
            num_predict=512,  # Max tokens to generate
        )
        
        # Output parser
        self.output_parser = StrOutputParser()
        
        # Define prompt template for RAG
        self.rag_prompt = PromptTemplate(
            input_variables=["context", "question"],
            template="""You are a helpful AI assistant for students. Use the following context to answer the question clearly and concisely.
If the context doesn't contain relevant information, say so politely.

Context:
{context}

Question: {question}

Answer:"""
        )
        
        # Define prompt for questions without context
        self.simple_prompt = PromptTemplate(
            input_variables=["question"],
            template="""You are a helpful AI assistant for students. Answer the following question concisely and accurately.

Question: {question}

Answer:"""
        )
        
        # Create chains using LCEL (LangChain Expression Language)
        self.rag_chain = self.rag_prompt | self.llm | self.output_parser
        self.simple_chain = self.simple_prompt | self.llm | self.output_parser
        
        print("✅ LLM service initialized successfully!")
    
    def generate_answer(self, question: str, context: str) -> str:
        """
        Generate a coherent answer from the question and context
        
        Args:
            question: User's question
            context: Retrieved context from RAG
            
        Returns:
            Generated answer
        """
        try:
            response = self.rag_chain.invoke({"question": question, "context": context})
            # Clean up the response
            answer = response.strip()
            
            # Remove any "Answer:" prefix if the model includes it
            if answer.lower().startswith("answer:"):
                answer = answer[7:].strip()
                
            return answer
        except Exception as e:
            print(f"❌ Error generating answer: {e}")
            return "I apologize, but I encountered an error while processing your question. Please try again."
    
    def generate_simple_answer(self, question: str) -> str:
        """
        Generate an answer without context (when no documents are available)
        
        Args:
            question: User's question
            
        Returns:
            Generated answer
        """
        try:
            response = self.simple_chain.invoke({"question": question})
            # Clean up the response
            answer = response.strip()
            
            # Remove any "Answer:" prefix if the model includes it
            if answer.lower().startswith("answer:"):
                answer = answer[7:].strip()
                
            return answer
        except Exception as e:
            print(f"❌ Error generating simple answer: {e}")
            return "I don't have enough information to answer that question. Please upload relevant documents to help me learn!"

# Global instance (lazy loaded)
_llm_service: Optional[LLMService] = None

def get_llm_service() -> LLMService:
    """
    Get or create the global LLM service instance
    """
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
