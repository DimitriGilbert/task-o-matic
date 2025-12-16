#!/bin/bash
Deafult_AI_provider=openrouter
Default_AI_model="z-ai/glm-4.6"
# ASCII art of a croissant. Because, why not?
echo "      .---. "
echo "     /    _ "
echo "    |   (_)  |"
echo "     \      /"
echo "      '----' "
echo "Bonjour, my friend! Welcome to ze 'task-o-matic' French demo."
echo "Today, we build something... 'très important'."
echo "An app to find ze perfect croissant. Because, life is too short for bad croissants, non?"
echo "---"
echo ""

# Step 1: Create workspace
echo "Step 1: We prepare ze workspace. A clean canvas for our masterpiece!"
WORKSPACE_DIR="le-croissant-workspace"

if [ -d "$WORKSPACE_DIR" ]; then
    echo "Ah, ze workspace exists. Let us clean it first!"
    rm -rf "$WORKSPACE_DIR"
fi

echo "Creating workspace: $WORKSPACE_DIR"
mkdir -p "$WORKSPACE_DIR"

echo "Copying .env file to workspace..."
if [ -f ".env" ]; then
    cp .env "$WORKSPACE_DIR/.env"
    source .env
    echo "✅ .env file copied to workspace!"
else
    echo "⚠️  No .env file found in current directory"
    echo "Creating example .env in workspace..."
    cat > "$WORKSPACE_DIR/.env" << EOENV
AI_PROVIDER=${AI_PROVIDER:-$Deafult_AI_provider}
AI_MODEL=${AI_MODEL:-$Default_AI_model}
OPENROUTER_API_KEY=your_openrouter_key_here
EOENV
    echo "📝 Please edit $WORKSPACE_DIR/.env with your API key"
fi

echo "Entering ze workspace..."
cd "$WORKSPACE_DIR"
echo "---"
echo ""

# Step 2: Create PRD
echo "Step 2: Ze 'Product Requirements Document', or... ze plan for battle!"
echo "Creating our masterpiece: prd_croissant.md"
cat > prd_croissant.md << EOF
# Project: Le Croissant Magique (The Magic Croissant)

## Vision
An application for ze true croissant connoisseurs. No more industrial pastries! We want butter, flaky layers, and love!

## Features
1.  **Map of Boulangeries**: Show all ze bakeries of Paris on an interactive map.
2.  **Croissant Rating**: Users can rate croissants with 5 stars (shaped like croissants, of course).
3.  **'Croissant of ze Day'**: Every day, ze app suggests ze best find, like a well-kept secret.
4.  **'Pure Butter' Filter**: A filter to see only bakeries using real butter. Zis is non-negotiable.

## Technical Requirements
- A simple and chic interface.
- It must work even during a transport strike (so, a good offline map is essential).
- Ze AI should be able to detect a croissant from a photo to verify its quality (maybe later, we are not magicians).
EOF
echo "Voilà! It is simple, it is clear, it is French."
echo "---"
echo ""

# Step 3: Initialize task-o-matic
echo "Step 3: We initialize task-o-matic in our workspace!"
../dist/cli/bin.js init init --project-name le-croissant-magique --package-manager bun
echo "Configuration... It is done. Ze AI is ready."
echo "Let's see if ze project is ready to run..."
if [ -f "le-croissant-magique/package.json" ]; then
    echo "✅ package.json found!"
    echo "Dependencies installed: $(ls le-croissant-magique/node_modules 2>/dev/null | wc -l) packages"
else
    echo "❌ package.json not found!"
    exit 1
fi
echo "---"
echo ""

# # Step 4: Configure AI
# echo "Step 4: We ask ze AI for 'elp. But, you know, politely."
# echo "Setting AI provider to our best value model..."
# ../dist/cli/bin.js config set-ai-provider "${AI_PROVIDER:-$Deafult_AI_provider}" "${AI_MODEL:-$Default_AI_model}"
# echo "✅ AI configured with ${AI_MODEL:-$Default_AI_model} @ ${AI_PROVIDER:-$Deafult_AI_provider}"
# echo "---"
# echo ""

mv .env le-croissant-magique/.env
cd le-croissant-magique

# Step 5: Parse ze PRD
echo "Step 5: Ze moment of truth! We give ze PRD to ze AI."
echo "Let's see if ze machine understands 'l'art du croissant'."
# ../../dist/cli/bin.js prd parse --file ../prd_croissant.md --stream
../../dist/cli/bin.js prd parse --file ../prd_croissant.md --stream --ai-reasoning 4000
echo ""

echo "---"
echo ""

# Step 6: List ze tasks
# echo "Step 6: And 'ere is ze work! Let us look at ze tasks ze AI 'as created for us."
# echo "Magnifique! It is almost like it is wearing a little beret."
# ../dist/cli/bin.js tasks list
# echo "---"
# echo ""

# Step 7: Enhance ALL ze tasks
# echo "Step 7: We make ALL ze tasks better! Like adding more butter to ALL ze croissants!"
# echo "First, let us see what tasks we have to enhance..."
# # ../dist/cli/bin.js tasks list
# echo ""
# echo "Now we enhance EACH AND EVERY task... like a very patient baker!"
# echo "Ze AI will make all our tasks more sophisticated with Context7 documentation!"
# ../dist/cli/bin.js tasks enhance --all --stream
# echo ""
# echo "Voilà! ALL tasks are now more... sophisticated. Like a French wine cellar!"
# echo "---"
# echo ""

# Step 8: Split ALL ze tasks
echo "Step 8: Now we split ALL ze tasks into smaller, bite-sized pieces!"
echo "Because big tasks are like... how you say... 'intimidating', non?"
echo "Ze AI will break down every task into manageable subtasks!"
# ../../dist/cli/bin.js tasks split --all --stream
../../dist/cli/bin.js tasks split --all --stream --reasoning 4000
echo ""
echo "Magnifique! Now we have many small tasks to conquer. Like eating a croissant one flaky layer at a time!"
echo "Let us see ze final result..."
../../dist/cli/bin.js tasks list
echo "---"
echo ""
echo "Now we enhance each task one by one... like a patient baker!"
echo "Note: In a real scenario, you would enhance each task by ID like:"
echo "../../dist/cli/bin.js tasks enhance --task-id <task-id> --stream"
echo "For now, let us create a new enhanced task to demonstrate!"
# ../dist/cli/bin.js tasks create --title "Enhanced Croissant Map Feature" --content "Create an interactive map showing all bakeries with real-time croissant quality ratings" --ai-enhance --stream
echo ""
echo "Voilà! Ze task is now more... sophisticated. Like a French wine!"
echo "---"
echo ""

echo "✅ Better-T-Stack project created! Let us explore..."
echo ""
echo "Project structure:"
ls -la le-croissant-magique/
echo ""

echo ""
echo "🎉 It is finished! Mission accomplished. Your Better-T-Stack project awaits!"
echo "📍 Location: $(pwd)/le-croissant-magique"
echo "💰 Note: We used ${AI_MODEL:-$Default_AI_model} from ${AI_PROVIDER:-$Deafult_AI_provider}"
echo "🔧 Your .env file is in: $(pwd)/.env"
echo "Now, it is time for a real croissant, non?"
echo "---"
echo ""
