# IMMIOS Product Catalog

## Overview

This document defines the complete product catalog for Instant Marquees Melbourne, including all product categories, specifications, and the business logic for job creation and stock management.

## Product Categories

### 1. Instant Marquees

Instant marquees are pre-assembled structures that can be quickly deployed. Each instant marquee consists of a frame and roof component.

#### Available Sizes and Variations

| Size | Frame Type | Roof Type | Notes |
|------|------------|-----------|-------|
| 2.4m x 2.4m | 30mm | Various colors/conditions | Standard size |
| 2.4m x 4.8m | 30mm | Various colors/conditions | Extended size |
| 3m x 3m | 30mm | Various colors/conditions | Popular size |
| 3m x 3m | 40mm | Various colors/conditions | Heavy-duty version |
| 4.5m x 3m | 30mm | Various colors/conditions | Wide format |
| 4.5m x 3m | 40mm | Various colors/conditions | Heavy-duty wide format |
| 6m x 3m | 30mm | Various colors/conditions | Large format |
| 6m x 3m | 40mm | Various colors/conditions | Heavy-duty large format |
| 3.6m x 3.6m | 40mm | Various colors/conditions | Square format |
| 6m x 4.5m | 40mm | Various colors/conditions | Extra large format |
| 6m x 6m | 40mm | Various colors/conditions | Maximum size |

#### Roof Specifications
- **Colors**: Various options available
- **Conditions**: New, Good, Poor
- **Material**: Fabric-based

#### Frame Specifications
- **Frame Types**: 30mm (standard), 40mm (heavy-duty)
- **Leg Configuration**: 
  - Most marquees: 4 legs
  - 6m x 3m: 6 legs
  - 6m x 6m: 8 legs

### 2. Structure Marquees

Structure marquees are stored as individual components and assembled on-site. They offer more flexibility in size and configuration.

#### Available Widths and Shapes

| Width | Shape | Fabric Options | Notes |
|-------|-------|----------------|-------|
| 3m | Apex | Clear fabric, Dome fabric | Standard width |
| 6m | Apex | Clear fabric, Dome fabric | Popular width |
| 6m | Dome | Clear fabric, Dome fabric | Curved design |
| 9m | Apex | Clear fabric, Dome fabric | Large format |
| 9m | Dome | Clear fabric, Dome fabric | Large curved design |

#### Component Structure
- Stored as individual components (not pre-assembled)
- Components include: frames, fabric panels, connectors, etc.
- Assembly required on-site
- Stock levels determine maximum buildable sizes

### 3. Furniture

Standard furniture items for event setups.

#### Available Items

| Item | Type | Material | Notes |
|------|------|----------|-------|
| Wooden Trestle Table | Table | Wood | Traditional style |
| Plastic Trestle Table | Table | Plastic | Lightweight option |
| White Bistro Chair | Chair | Various materials | Outdoor dining |
| Black Folding Chair | Chair | Metal/Plastic | Stackable |
| White Folding Chair | Chair | Metal/Plastic | Stackable |
| White Bistro Round Table | Table | Various materials | Outdoor dining |

### 4. Umbrellas

Various umbrella sizes with specific base requirements.

#### Available Sizes

| Size | Type | Base Type | Notes |
|------|------|-----------|-------|
| 2.8m | Octagonal | Specific base | Standard size |
| 3m | Square | Specific base | Square format |
| 5m | Jumbo | Specific base | Large format |

#### Color Variations
- Each umbrella size available in multiple colors
- Color selection affects base compatibility

## Weighting and Anchoring Accessories

### Weighting Options

#### Sandbags
- **Usage**: Primarily for umbrellas
- **Quantity per umbrella**:
  - 2.8m Octagonal: 2 sandbags
  - 3m Square: 2 sandbags
  - 5m Jumbo: 4 sandbags

#### Concrete Slabs
- **Usage**: 5m Jumbo Umbrella only
- **Quantity**: 8 slabs per 5m Jumbo Umbrella

#### Steel Weights
- **Usage**: Instant and Structure marquees
- **Quantity per leg**:
  - Instant marquees: 5 steel weights per leg
  - Structure marquees: 5 steel weights per leg

### Anchoring Options

#### Pegging (where applicable)
- **Instant marquees**: Can be pegged (except 5m Jumbo umbrella)
- **Structure marquees**: Can be pegged
- **Umbrellas**: Can be pegged (except 5m Jumbo umbrella)

#### Pop-up Pegs
- **Usage**: Umbrellas and Instant marquees
- **Quantity**:
  - Umbrellas: 4 pegs per umbrella
  - Instant marquees: 2 pegs per leg

#### Structure Pegs
- **Usage**: Structure marquees only
- **Types**: 600mm and 900mm pegs
- **Quantity**: 1 x 600mm + 1 x 900mm per structure leg

#### Water Barrels
- **Small water barrels**: Used on Instant marquees (1 per leg)
- **Large water barrels**: Used on Structure marquees (1 per leg)

## Job Creation Business Logic

### Instant Marquee Configuration

When a user requests a specific size (e.g., 3m x 18m), the system should:

1. **Calculate possible configurations** using available instant marquee sizes
2. **Present options** to the user for selection
3. **Check stock availability** for each configuration
4. **Create assembly tasks** if needed

#### Example: 3m x 18m Request
Possible configurations:
- 6 x 3m x 3m (30mm or 40mm)
- 4 x 3m x 3m + 1 x 6m x 3m
- 2 x 3m x 3m + 2 x 6m x 3m
- 3 x 6m x 3m

### Structure Marquee Configuration

For structure marquees:

1. **Check component stock levels** to determine maximum buildable sizes
2. **Prompt for shape selection** (Apex or Dome)
3. **Validate fabric availability** (Clear or Dome fabric)
4. **Create assembly tasks** based on component requirements

### Stock Allocation Logic

#### Assembly Task Creation
When stock levels are insufficient for assembled products:

1. **Check available components** (frames, roofs, etc.)
2. **Calculate assembly requirements** based on job specifications
3. **Create assembly tasks** with specific component requirements
4. **Consider condition preferences** and suggest alternatives if needed

#### Example Assembly Scenario
**Available Stock**:
- 10 x 3m x 3m assembled marquees
- 5 x 3m x 3m Roof (Good condition)
- 5 x 3m x 3m Roof (Poor condition)
- 7 x 3m x 3m Frame

**Job Request**: 1 x 3m x 30m and 1 x 6m x 3m (using 3m x 3m only)

**System Action**:
1. Allocate 10 assembled 3m x 3m marquees
2. Create assembly task for 2 additional 3m x 3m marquees
3. Use available frames (7) and roofs (10 total)
4. Prioritize Good condition roofs, suggest Poor condition as backup

### Condition Management

#### Roof Condition Logic
1. **Check requested condition** for the job
2. **Verify availability** of requested condition
3. **Suggest alternatives** if insufficient stock:
   - Offer better condition if available
   - Offer lower condition if no better option
   - Require user approval for condition substitution

#### Component Condition Tracking
- Track condition of individual components
- Maintain condition history
- Allow condition-based filtering in stock management

## Stock Management Integration

### Real-time Stock Checking
- **Job creation**: Real-time availability checking
- **Assembly alerts**: Automatic task creation when needed
- **Condition tracking**: Monitor component conditions
- **Stock warnings**: Alert when minimum levels reached

### Assembly Task Management
- **Automatic creation**: Based on job requirements
- **Component allocation**: Specify exact components needed
- **Condition preferences**: Match job requirements
- **Progress tracking**: Monitor assembly completion

### Inventory Optimization
- **Smart allocation**: Use best available components
- **Condition matching**: Prioritize requested conditions
- **Efficient assembly**: Minimize unnecessary assembly tasks
- **Stock rotation**: Use older components first

## Future Implementation Notes

### Phase 1: Basic Product Catalog
- Implement product categories and specifications
- Create basic stock management for assembled products
- Add simple job creation with product selection

### Phase 2: Component Management
- Implement component-level tracking
- Add assembly task creation
- Implement condition-based stock management

### Phase 3: Advanced Configuration
- Add intelligent size calculation for Instant marquees
- Implement component-based structure marquee sizing
- Add advanced assembly task management

### Phase 4: Optimization
- Implement smart stock allocation algorithms
- Add predictive assembly scheduling
- Optimize component usage and rotation

## Database Schema Considerations

### Product Collections
```typescript
// Assembled Products
interface AssembledProduct {
  id: string;
  name: string;
  category: 'instant' | 'structure' | 'furniture' | 'umbrella';
  size: string;
  frameType?: '30mm' | '40mm';
  shape?: 'apex' | 'dome';
  fabricType?: 'clear' | 'dome';
  color?: string;
  condition: 'new' | 'good' | 'poor';
  currentStock: number;
  minStockLevel: number;
  components?: ComponentReference[];
}

// Components
interface Component {
  id: string;
  name: string;
  category: string;
  type: string;
  size?: string;
  color?: string;
  condition: 'new' | 'good' | 'poor';
  currentStock: number;
  minStockLevel: number;
  usedInProducts: string[];
}

// Assembly Tasks
interface AssemblyTask {
  id: string;
  productId: string;
  quantity: number;
  requiredComponents: ComponentRequirement[];
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt: Date;
  completedAt?: Date;
}
```

This document serves as the comprehensive guide for implementing the product catalog and job creation system in IMMIOS. 