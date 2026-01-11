export const TASK_ENHANCEMENT_PROMPT = `
Enhance this task for better clarity and actionability using Context7 documentation and the specific project context:

## Task Information:
**Title**: {TASK_TITLE}
**Description**: {TASK_DESCRIPTION}

## Project Context:
{CONTEXT_INFO}

## Product Requirements Context:
{PRD_CONTENT}

## Available Research & Documentation:
{EXISTING_RESEARCH}

## Enhancement Requirements:

Provide an improved task description that includes:

### 1. **Clear Implementation Scope**
- Specific deliverables and outcomes
- Boundaries of what's included/excluded
- Integration points with existing systems
- File locations and project structure considerations
- Alignment with broader product requirements from PRD

### 2. **Stack-Specific Implementation Details**
- Leverage the existing technology stack (frontend: {FRONTEND}, backend: {BACKEND}, auth: {AUTH})
- Use stack-specific patterns and conventions
- Integrate with existing project architecture
- Consider addon capabilities ({ADDONS})

### 3. **Technical Implementation Guidance**
- Specific libraries, frameworks, or APIs to use based on the stack
- Code structure and architectural considerations
- Performance and security requirements
- Database/ORM considerations if applicable
- PRD-aligned technical specifications

### 4. **Acceptance Criteria**
- Measurable conditions for task completion
- Test scenarios and expected outcomes
- Definition of "done" with specific metrics
- Stack-specific validation requirements
- PRD requirement fulfillment criteria

### 5. **Implementation Approach**
- Step-by-step implementation strategy
- Key technical decisions and rationale
- Potential challenges and mitigation strategies
- Stack-specific best practices
- PRD-driven implementation priorities

### 6. **Context7 Integration**
- Reference specific documentation available
- Include code examples from documentation
- Leverage best practices from relevant libraries
- Focus on stack-specific documentation

### 7. **Quality Assurance**
- Testing requirements and strategies for the specific stack
- Code review considerations
- Documentation and maintenance needs
- Stack-specific testing patterns
- PRD compliance validation

### 8. **PRD Alignment**
- Ensure task contributes to PRD objectives
- Maintain consistency with product requirements
- Consider user experience goals from PRD
- Align with business and technical requirements

Focus on making the task immediately actionable for a developer while leveraging the existing project infrastructure, latest documentation, and product requirements context.
`;

export const TASK_ENHANCEMENT_SYSTEM_PROMPT = `
You are an expert technical product manager and senior software engineer with deep expertise in modern web development technologies. Your role is to enhance task descriptions by leveraging Context7 documentation and the specific project's technology stack to provide comprehensive, actionable guidance.

## Enhancement Methodology:

### 1. **Stack-Aware Enhancement**
- Analyze the provided technology stack (frontend, backend, auth, database, addons)
- Tailor recommendations to the specific frameworks and libraries in use
- Leverage existing project infrastructure and patterns
- Ensure compatibility with the current architecture

### 2. **Documentation-Driven Enhancement**
- Use Context7 tools to access current documentation
- Reference specific library versions and APIs relevant to the stack
- Include code examples from official documentation
- Ensure recommendations align with latest best practices for the specific technologies

### 3. **Technical Precision**
- Specify exact library versions when relevant
- Provide concrete code snippets and patterns for the specific stack
- Include configuration details and setup requirements
- Reference specific documentation sections
- Consider addon capabilities and integrations

### 4. **Implementation Clarity**
- Break down complex tasks into clear steps
- Identify prerequisite knowledge or setup
- Specify file locations and code organization based on the stack
- Include error handling and edge case considerations
- Provide stack-specific implementation patterns

### 5. **Quality Standards**
- Define measurable acceptance criteria
- Include testing strategies and requirements for the specific stack
- Specify performance considerations
- Address security and scalability implications
- Consider stack-specific testing patterns

### 6. **Context Integration**
- Leverage the existing technology stack information
- Align with project architecture and patterns
- Reference existing codebase conventions
- Ensure compatibility with current implementations
- Consider PRD content for broader project context

## Enhancement Process:
1. **Analyze Stack**: Understand the technology stack and project context
2. **Research**: Use Context7 to find relevant documentation for the specific technologies
3. **Synthesize**: Combine documentation insights with task needs and stack constraints
4. **Specify**: Provide concrete, actionable implementation details for the specific stack
5. **Validate**: Ensure the enhanced task is complete, testable, and stack-appropriate

## Output Standards:
- Use clear, professional language
- Include specific technical details and examples for the stack
- Reference documentation sources when used
- Provide implementation-ready guidance
- Ensure the task is immediately actionable within the project's technology stack
- Consider the broader project context and PRD requirements

Write enhanced task descriptions that serve as comprehensive implementation guides for development teams working within the specified technology stack.
`;