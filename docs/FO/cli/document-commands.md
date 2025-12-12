---
## TECHNICAL BULLETIN NO. 004
### DOCUMENT COMMANDS - KNOWLEDGE MANAGEMENT FIELD OPERATIONS

**DOCUMENT ID:** `task-o-matic-cli-document-commands-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, documentation commands are your library in the post-deadline wasteland. Without proper knowledge management, you're reinventing wheels in the dark. These commands provide AI-powered documentation research, analysis, and integration that gives you the wisdom of survivors who came before.

### COMMAND ARCHITECTURE OVERVIEW
The document command group represents the knowledge management layer of Task-O-Matic. It bridges the gap between implementation tasks and relevant documentation through AI-powered research, analysis, and caching. The architecture supports automatic documentation detection, Context7 integration, and task-specific knowledge enhancement.

**Knowledge Management Components:**
- **AI-Powered Research**: Automatic documentation discovery and retrieval
- **Context7 Integration**: MCP-based documentation access from multiple sources
- **Task-Specific Enhancement**: Documentation tailored to individual task requirements
- **Intelligent Caching**: Freshness tracking and cache management
- **Cross-Reference Linking**: Connections between tasks and relevant documentation

### COMPLETE DOCUMENT COMMAND DOCUMENTATION

## DOCUMENT COMMAND (ANALYZE)
**Command:** `task-o-matic tasks document`

### COMMAND SIGNATURE
```bash
task-o-matic tasks document --task-id <id> [options]
```

### REQUIRED OPTIONS
```bash
--task-id <id>              # Task ID to document (required)
```

### OPTIONAL OPTIONS
```bash
--force                      # Force refresh documentation even if recent
--stream                     # Show streaming AI output during analysis
--ai-provider <provider>       # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>               # AI API key override
--ai-provider-url <url>       # AI provider URL override
--reasoning <tokens>          # Enable reasoning for OpenRouter models (max reasoning tokens)
```

### DOCUMENT ANALYZE EXAMPLES

#### Basic Documentation Analysis
```bash
# Analyze task documentation
task-o-matic tasks document --task-id task-123

# Force refresh documentation
task-o-matic tasks document --task-id task-123 --force

# Analyze with streaming
task-o-matic tasks document --task-id task-123 --stream
```

#### AI-Enhanced Documentation Analysis
```bash
# Analyze with custom AI provider
task-o-matic tasks document \
  --task-id task-123 \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet

# Analyze with reasoning enabled
task-o-matic tasks document \
  --task-id task-123 \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --reasoning 2048

# Analyze with streaming and custom model
task-o-matic tasks document \
  --task-id task-complex-789 \
  --stream \
  --ai-provider openai \
  --ai-model gpt-4
```

#### Advanced Documentation Scenarios
```bash
# Force refresh stale documentation
task-o-matic tasks document \
  --task-id task-old-123 \
  --force \
  --ai-provider anthropic \
  --ai-model claude-opus-2024

# Analyze security-critical task
task-o-matic tasks document \
  --task-id task-security-system \
  --stream \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --reasoning 4096

# Analyze research-heavy task
task-o-matic tasks document \
  --task-id task-research-456 \
  --ai-provider openai \
  --ai-model o1-preview \
  --reasoning 8192
```

### DOCUMENTATION ANALYSIS PROCESS
1. **Task Context Gathering**: Collect task details, project structure, and related tasks
2. **Documentation Detection**: Identify relevant libraries, frameworks, and technologies
3. **Context7 Query**: Search for documentation using MCP tools
4. **AI Analysis**: Process and synthesize documentation for task relevance
5. **Caching Strategy**: Store results with freshness tracking
6. **Knowledge Integration**: Link documentation to task for future reference

### DOCUMENTATION OUTPUT FORMAT
- **Task Context**: Current task details and project structure
- **Research Summary**: AI-generated overview of findings
- **Library Information**: Relevant libraries and frameworks with details
- **Documentation Links**: Direct links to retrieved documentation
- **Freshness Indicators**: Cache status and last update times
- **Confidence Scores**: AI confidence in documentation relevance

### ERROR CONDITIONS
```bash
# Task not found
Error: Task not found: invalid-task-id
Solution: Verify task ID with 'task-o-matic tasks list'

# Documentation already fresh
Warning: Documentation is fresh (2 days old)
Solution: Use --force to refresh or skip if current is sufficient

# AI analysis failure
Error: Failed to analyze documentation with AI
Solution: Check AI provider configuration and network connectivity

# Context7 access error
Error: Failed to retrieve documentation from Context7
Solution: Check Context7 API key and network access
```

## GET-DOCUMENTATION COMMAND
**Command:** `task-o-matic tasks get-documentation`

### COMMAND SIGNATURE
```bash
task-o-matic tasks get-documentation --id <id>
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task ID (required)
```

### GET-DOCUMENTATION EXAMPLES

#### Basic Documentation Retrieval
```bash
# Get documentation for task
task-o-matic tasks get-documentation --id task-123

# Get documentation for subtask
task-o-matic tasks get-documentation --id task-123-456

# Get documentation for complex task
task-o-matic tasks get-documentation --id task-shelter-system
```

#### Documentation Review Examples
```bash
# Review documentation before execution
task-o-matic tasks get-documentation --id task-123
task-o-matic tasks execute --id task-123

# Compare documentation across tasks
task-o-matic tasks get-documentation --id task-authentication
task-o-matic tasks get-documentation --id task-authorization

# Get documentation for planning
task-o-matic tasks get-documentation --id task-database-design
task-o-matic tasks plan --id task-database-design
```

#### Documentation Analysis Examples
```bash
# Check documentation freshness
task-o-matic tasks get-documentation --id task-123

# Review documentation sources
task-o-matic tasks get-documentation --id task-security-system

# Validate documentation completeness
task-o-matic tasks get-documentation --id task-api-integration
```

### DOCUMENTATION DISPLAY FORMAT
- **Task Information**: Task title, ID, and current status
- **File Location**: Path to stored documentation file
- **Content Preview**: First 200 characters of documentation content
- **Metadata**: Creation date, last fetched, sources used
- **Freshness Info**: Age of documentation and cache status
- **Related Tasks**: Links to other tasks with similar documentation

### ERROR CONDITIONS
```bash
# Task not found
Error: Task not found: invalid-task-id
Solution: Verify task ID exists

# Documentation not found
Warning: No documentation found for task task-123
Solution: Run 'task-o-matic tasks document' to create documentation

# File access error
Error: Cannot read documentation file
Solution: Check file permissions and disk space

# Invalid documentation format
Error: Documentation file corrupted or invalid format
Solution: Re-run documentation analysis
```

## ADD-DOCUMENTATION COMMAND
**Command:** `task-o-matic tasks add-documentation`

### COMMAND SIGNATURE
```bash
task-o-matic tasks add-documentation --id <id> --doc-file <path> [options]
```

### REQUIRED OPTIONS
```bash
-i, --id <id>               # Task ID (required)
-f, --doc-file <path>        # Path to documentation file (required)
```

### OPTIONAL OPTIONS
```bash
-o, --overwrite               # Overwrite existing documentation
```

### ADD-DOCUMENTATION EXAMPLES

#### Basic Documentation Addition
```bash
# Add documentation from file
task-o-matic tasks add-documentation \
  --id task-123 \
  --doc-file ./research-notes.md

# Add documentation with overwrite
task-o-matic tasks add-documentation \
  --id task-123 \
  --doc-file ./updated-docs.md \
  --overwrite

# Add documentation for subtask
task-o-matic tasks add-documentation \
  --id task-123-456 \
  --doc-file ./subtask-research.md
```

#### Advanced Documentation Management
```bash
# Add comprehensive documentation
task-o-matic tasks add-documentation \
  --id task-security-system \
  --doc-file ./security-analysis.md \
  --overwrite

# Add documentation from external research
task-o-matic tasks add-documentation \
  --id task-api-design \
  --doc-file ./external-api-docs.md

# Add documentation with confirmation
task-o-matic tasks add-documentation \
  --id task-database-schema \
  --doc-file ./schema-documentation.md
```

#### Documentation File Examples
```bash
# Create documentation file
cat > security-research.md << EOF
# Security Analysis for Authentication System

## Overview
Analysis of security requirements for shelter authentication system.

## Threat Model
- Unauthorized access attempts
- Data breaches
- Privilege escalation
- Session hijacking

## Security Requirements
### Authentication
- Multi-factor authentication
- Rate limiting
- Session management
- Password policies

### Authorization
- Role-based access control
- Principle of least privilege
- API access controls
- Resource permissions

### Data Protection
- Encryption at rest and in transit
- Data masking
- Audit logging
- Backup and recovery

## Implementation Guidelines
1. Use industry-standard authentication libraries
2. Implement proper session management
3. Follow OWASP security guidelines
4. Regular security audits and penetration testing
5. Keep documentation updated with latest threats

## References
- OWASP Authentication Cheat Sheet
- NIST Cybersecurity Framework
- Industry security best practices
EOF

# Add created documentation
task-o-matic tasks add-documentation \
  --id task-security-implementation \
  --doc-file ./security-research.md
```

### DOCUMENTATION VALIDATION
- **File Existence**: Verify documentation file exists and is readable
- **Task Existence**: Confirm target task exists
- **Permission Check**: Ensure write access to task documentation directory
- **Format Validation**: Verify documentation content is meaningful
- **Size Limits**: Check documentation doesn't exceed storage limits
- **Overwrite Logic**: Handle existing documentation appropriately

### ERROR CONDITIONS
```bash
# Missing required options
Error: Missing required arguments: id, doc-file
Solution: Provide both --id and --doc-file

# Task not found
Error: Task not found: invalid-task-id
Solution: Verify task ID exists

# Documentation file not found
Error: Documentation file not found: ./docs.md
Solution: Verify file path and permissions

# Documentation already exists
Warning: Documentation already exists for task task-123
Solution: Use --overwrite to replace existing documentation

# Permission denied
Error: Cannot write documentation file: Permission denied
Solution: Check file permissions and directory access
```

### DOCUMENTATION FILE FORMATS

#### Markdown Documentation
```markdown
# Documentation for Task: [Task Title]

## Overview
[Brief description of what the task accomplishes]

## Technical Requirements
[Libraries, frameworks, and tools needed]

## Implementation Details
[Step-by-step implementation guidance]

## Code Examples
[Relevant code snippets and patterns]

## Testing Considerations
[Testing strategies and requirements]

## References
[Links to relevant documentation and resources]
```

#### Structured Documentation
```json
{
  "task": "task-123",
  "title": "Task Title",
  "overview": "Task description",
  "requirements": {
    "libraries": ["library1", "library2"],
    "frameworks": ["framework1"],
    "tools": ["tool1"]
  },
  "implementation": {
    "steps": ["Step 1", "Step 2"],
    "codeExamples": {
      "example1": "code snippet",
      "example2": "code snippet"
    }
  },
  "testing": {
    "strategy": "unit and integration testing",
    "requirements": ["jest", "supertest"]
  },
  "references": [
    {
      "title": "Relevant Documentation",
      "url": "https://example.com/docs"
    }
  ],
  "metadata": {
    "lastUpdated": "2024-01-15T10:30:00Z",
    "sources": ["Context7", "Manual Research"],
    "confidence": 0.95
  }
}
```

### FIELD OPERATIONS PROTOCOLS

#### DOCUMENTATION LIFECYCLE MANAGEMENT
The document commands implement a complete knowledge management system:

1. **Research Phase**
   - Task context analysis and requirement identification
   - Automatic technology and library detection
   - Context7 MCP integration for comprehensive research
   - AI-powered documentation synthesis and analysis

2. **Acquisition Phase**
   - Documentation retrieval from multiple sources
   - Content validation and quality assessment
   - Cross-reference linking between related documentation
   - Metadata extraction and storage

3. **Integration Phase**
   - Task-specific documentation enhancement
   - Linkage between tasks and relevant knowledge
   - Automatic freshness tracking and cache management
   - Integration with execution workflows

4. **Management Phase**
   - Documentation addition from external sources
   - Version control and change tracking
   - Overwrite protection and confirmation logic
   - Backup and recovery capabilities

#### AI INTEGRATION PATTERNS
Documentation operations leverage AI through standardized patterns:

- **Context-Aware Research**: Automatic inclusion of project structure and dependencies
- **Multi-Source Synthesis**: Combine information from multiple documentation sources
- **Quality Assessment**: AI evaluation of documentation relevance and completeness
- **Intelligent Caching**: Freshness tracking and optimal cache utilization
- **Cross-Reference Analysis**: Automatic linking between related documentation items

#### CONTEXT7 MCP INTEGRATION
Documentation commands integrate with Context7 through MCP tools:

- **Library Documentation**: Access to up-to-date library documentation
- **Framework Guides**: Current best practices and implementation patterns
- **API References**: Comprehensive API documentation and examples
- **Tutorial Content**: Step-by-step guides and learning materials
- **Code Examples**: Real-world implementation examples and patterns

#### STORAGE INTEGRATION
Documentation is stored using an organized approach:

- **Task-Specific Storage**: Documentation linked directly to tasks
- **Metadata Management**: Rich metadata including sources and freshness
- **Cache Optimization**: Intelligent caching for performance and cost efficiency
- **Version Control**: Change tracking and history maintenance
- **Cross-Reference Index**: Links between related documentation items

### SURVIVAL SCENARIOS

#### SCENARIO 1: Security System Documentation
```bash
# Analyze security requirements
task-o-matic tasks document \
  --task-id task-authentication-system \
  --stream \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet

# Add external security research
task-o-matic tasks add-documentation \
  --id task-authentication-system \
  --doc-file ./security-analysis.md \
  --overwrite

# Review comprehensive documentation
task-o-matic tasks get-documentation --id task-authentication-system

# Execute with documentation context
task-o-matic tasks execute \
  --id task-authentication-system \
  --plan \
  --review
```

#### SCENARIO 2: API Integration Documentation
```bash
# Document API requirements
task-o-matic tasks document \
  --task-id task-api-integration \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --reasoning 2048

# Add API documentation
task-o-matic tasks add-documentation \
  --id task-api-integration \
  --doc-file ./external-api-docs.md

# Get combined documentation view
task-o-matic tasks get-documentation --id task-api-integration
```

#### SCENARIO 3: Research and Development Tasks
```bash
# Document research task
task-o-matic tasks document \
  --task-id task-radiation-research \
  --stream \
  --ai-provider openai \
  --ai-model o1-preview \
  --reasoning 8192

# Add research findings
task-o-matic tasks add-documentation \
  --id task-radiation-research \
  --doc-file ./research-findings.md

# Force refresh outdated research
task-o-matic tasks document \
  --task-id task-radiation-research \
  --force \
  --ai-provider anthropic \
  --ai-model claude-opus-2024
```

#### SCENARIO 4: Infrastructure and Setup Tasks
```bash
# Document infrastructure requirements
task-o-matic tasks document \
  --task-id task-shelter-infrastructure \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet

# Add setup documentation
task-o-matic tasks add-documentation \
  --id task-shelter-infrastructure \
  --doc-file ./infrastructure-setup.md

# Review infrastructure documentation
task-o-matic tasks get-documentation --id task-shelter-infrastructure
```

#### SCENARIO 5: Emergency Response Planning
```bash
# Document emergency procedures
task-o-matic tasks document \
  --task-id task-emergency-response \
  --stream \
  --ai-provider anthropic \
  --ai-model claude-opus-2024 \
  --reasoning 4096

# Add emergency protocols
task-o-matic tasks add-documentation \
  --id task-emergency-response \
  --doc-file ./emergency-protocols.md

# Create comprehensive emergency documentation
task-o-matic tasks add-documentation \
  --id task-emergency-response \
  --doc-file ./crisis-management.md \
  --overwrite
```

### TECHNICAL SPECIFICATIONS

#### DOCUMENTATION DATA MODEL
```typescript
interface TaskDocumentation {
  taskId: string;                    // Associated task ID
  content: string;                   // Documentation content
  metadata: {                        // Documentation metadata
    lastFetched: Date;            // When documentation was retrieved
    sources: string[];             // Source of documentation
    libraries: string[];            // Referenced libraries
    frameworks: string[];           // Referenced frameworks
    confidence: number;             // AI confidence in relevance
    aiProvider?: string;            // AI provider used
    aiModel?: string;                // AI model used
    reasoning?: boolean;             // Whether reasoning was used
  };
  createdAt: Date;                   // Documentation creation timestamp
  updatedAt: Date;                   // Last modification timestamp
  version?: number;                  // Documentation version
}
```

#### PERFORMANCE CHARACTERISTICS
- **Documentation Analysis**: 10-60s depending on task complexity
- **Context7 Queries**: 2-10s per documentation request
- **AI Processing**: 5-30s for documentation synthesis
- **File Storage**: 20-100ms per documentation file
- **Cache Operations**: 5-50ms for cache checks and updates

#### STORAGE REQUIREMENTS
- **Documentation Files**: 10-200KB per task
- **Metadata Storage**: 1-5KB per documentation entry
- **Cache Storage**: 50-200MB for project documentation cache
- **Context7 Cache**: 100-500MB for external documentation cache
- **Index Overhead**: 20-100KB for documentation indices

#### CONTEXT7 INTEGRATION SPECIFICATIONS
- **MCP Protocol**: Model Context Protocol for tool access
- **Documentation Sources**: Multiple library and framework documentation providers
- **Caching Strategy**: TTL-based caching with freshness tracking
- **Query Optimization**: Intelligent query batching and result caching
- **Error Handling**: Graceful fallback when Context7 unavailable

#### CONCURRENCY AND SAFETY
- **Atomic Operations**: Safe concurrent documentation access
- **File Locking**: Prevents corruption during updates
- **Cache Coherency**: Consistent state across operations
- **Version Control**: Track changes and enable rollback
- **Permission Validation**: Ensure proper file access rights

**Remember:** Citizen, in the information-scarce wasteland, knowledge is your greatest weapon. These documentation commands provide the intelligence and research capabilities needed to make informed decisions and avoid repeating mistakes of the past. Use them to build a comprehensive knowledge base that will guide your projects to success.

---

**DOCUMENT STATUS:** `Complete`  
**NEXT REVIEW:** `After Context7 API updates`  
**CONTACT:** `Task-O-Matic Documentation Team`